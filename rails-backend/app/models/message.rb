class Message
  include Mongoid::Document
  include Mongoid::Timestamps

  field :to_number,   type: String
  field :from_number, type: String
  field :body,        type: String
  field :twilio_sid,  type: String
  field :status,      type: String, default: "created"
  field :error_code,  type: Integer

  index({ user_id: 1, created_at: -1 })
  index({ twilio_sid: 1 })

  before_validation :normalize_phone

  validates :to_number, presence: true
  validates :body, presence: true


  def normalize_phone
    return unless to_number.present?

    raw = to_number.strip
    return unless raw.start_with?('+')

    self.to_number = "+#{raw.gsub(/\D/, '')}"
  end




  validates :to_number,
            format: {
              with: /\A\+[1-9]\d{9,14}\z/,
              message: "must be in E.164 format (e.g. +15555551212)"
            }



  belongs_to :user
end
