class User
  include Mongoid::Document
  include Mongoid::Timestamps

  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""
  field :jti,                type: String, default: ""

  index({ email: 1 }, unique: true)

  devise :database_authenticatable,
         :registerable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  has_many :messages

  def self.find_for_jwt_authentication(payload)
    sub =
      case payload
      when Hash
        payload["sub"] || payload[:sub]
      else
        payload
      end

    return nil if sub.blank?

    find(sub) # Mongoid finds by _id
  rescue Mongoid::Errors::DocumentNotFound
    nil
  end

end
