class JwtDenylist
  include Mongoid::Document
  include Mongoid::Timestamps

  field :jti, type: String
  field :exp, type: Time

  index({ jti: 1 }, unique: true)
  index({ exp: 1 })

  def self.jwt_revoked?(payload, _user)
    return false unless payload.is_a?(Hash)
    where(jti: payload["jti"]).exists?
  end

  def self.revoke_jwt(payload, _user)
    return unless payload.is_a?(Hash)
    create!(jti: payload["jti"], exp: Time.at(payload["exp"]))
  end
end
