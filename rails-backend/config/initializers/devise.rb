Devise.setup do |config|
  config.navigational_formats = []
  config.skip_session_storage = [:http_auth, :params_auth]

  config.jwt do |jwt|
    jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY")

    jwt.dispatch_requests = [
      ["POST", %r{^/login$}],
      ["POST", %r{^/signup$}]
    ]

    jwt.revocation_requests = [
      ["DELETE", %r{^/logout$}]
    ]

    jwt.expiration_time = 24.hours.to_i
    jwt.request_formats = { user: [:json] }
  end
end
