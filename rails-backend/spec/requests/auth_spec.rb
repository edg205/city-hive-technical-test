# spec/requests/auth_spec.rb
require "rails_helper"
require "jwt"

RSpec.describe "Auth", type: :request do
  let(:email) { "test@example.com" }
  let(:password) { "password123!" }

  describe "POST /signup" do
    it "creates a user and returns Authorization header" do
      post "/signup", params: { user: { email: email, password: password, password_confirmation: password } }, as: :json

      expect(response).to have_http_status(:created)
      expect(response.headers["Authorization"]).to be_present
      expect(JSON.parse(response.body).dig("user", "email")).to eq(email)
    end
  end

  describe "POST /login" do
    before do
      User.create!(email: email, password: password)
    end

    it "signs in and returns Authorization header" do
      post "/login", params: { user: { email: email, password: password } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to be_present
    end
  end

  describe "DELETE /logout" do
    before do
      User.create!(email: email, password: password)
    end

    it "revokes token via denylist" do
      # login to get token
      post "/login", params: { user: { email: email, password: password } }, as: :json
      token = response.headers["Authorization"]
      expect(token).to be_present

      # decode to get jti for later assertion
      raw = token.to_s.split.last
      payload, = JWT.decode(raw, ENV.fetch("DEVISE_JWT_SECRET_KEY"), true, { algorithm: "HS256" })
      jti = payload["jti"]
      expect(jti).to be_present

      delete "/logout", headers: { "Authorization" => token }, as: :json
      expect(response).to have_http_status(:no_content)

      expect(JwtDenylist.where(jti: jti).exists?).to eq(true)
    end
  end
end
