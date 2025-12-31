Devise.setup do |config|
  config.navigational_formats = []

  # Stateless API: don't store anything in session
  config.skip_session_storage = [:http_auth, :params_auth]

  config.jwt do |jwt|
    jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY")
    jwt.dispatch_requests = [
      ["POST", %r{^/api/login$}],
      ["POST", %r{^/api/signup$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/logout$}]
    ]
    jwt.expiration_time = 24.hours.to_i
  end
end
