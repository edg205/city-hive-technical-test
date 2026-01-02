class User
  include Mongoid::Document
  include Mongoid::Timestamps

  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""
  field :jit,                type: String, default: ""

  index({ email: 1 }, unique: true)

  devise :database_authenticatable,
         :registerable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  has_many :messages

  def self.find_for_jwt_authentication(payload)
    Rails.logger.info "payload = #{payload.inspect}"
    sub = {_id: payload}
    Rails.logger.info "sub = #{sub}"
    return nil if sub.blank?

    find(sub)
  rescue Mongoid::Errors::DocumentNotFound
    nil
  end

end
