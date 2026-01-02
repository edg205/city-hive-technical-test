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

  validates :to_number, :body, presence: true

  belongs_to :user
end
