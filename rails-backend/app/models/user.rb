class User
  include Mongoid::Document
  include Mongoid::Timestamps

  include Devise::JWT::RevocationStrategies::JTIMatcher

  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""
  field :jti,                type: String

  index({ email: 1 }, unique: true)

  devise :database_authenticatable,
         :registerable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self

  has_many :messages
end
