# spec/support/auth_helpers.rb
module AuthHelpers
  DEFAULT_PASSWORD = "password123!".freeze

  def ensure_user!(email:, password: DEFAULT_PASSWORD)
    User.find_by(email: email) || User.create!(email: email, password: password, password_confirmation: password)
  end

  def login_and_get_token(email:, password: DEFAULT_PASSWORD)
    ensure_user!(email: email, password: password)

    post "/login",
         params: { user: { email: email, password: password } },
         as: :json

    # Helpful debugging if it fails again
    unless response.status == 200
      raise "Login failed: status=#{response.status} body=#{response.body}"
    end

    token = response.headers["Authorization"]
    raise "Missing Authorization header on login response" if token.blank?

    token
  end

  def auth_headers(token)
    { "Authorization" => token }
  end
end
