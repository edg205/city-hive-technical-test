# spec/requests/api/messages_spec.rb
require "rails_helper"

RSpec.describe "API::Messages", type: :request do
  let!(:user) { User.create!(email: "test@example.com", password: "password123!") }
  let(:token) { login_and_get_token(email: user.email, password: "password123!") }

  before do

    # Prevent real Twilio calls
    allow(TwilioSendSmsService).to receive(:call).and_return(
      { sid: "SM_TEST_123", status: "queued" }
    )

    # Avoid needing a real env var in test
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("TWILIO_FROM_NUMBER").and_return("15551234567")
  end

  describe "GET /api/messages" do
    it "returns an empty list when the user has no messages" do
      get "/api/messages", headers: auth_headers(token)

      expect(response).to have_http_status(:ok)
      expect(json).to include("messages")
      expect(json["messages"]).to eq([])
    end

    it "returns the user's messages in reverse chronological order (max 100)" do
      m1 = user.messages.create!(to_number: "15555550001", body: "older", from_number: "15551234567")
      m2 = user.messages.create!(to_number: "15555550002", body: "newer", from_number: "15551234567")
      m1.update!(created_at: 2.days.ago)
      m2.update!(created_at: 1.day.ago)

      get "/api/messages", headers: auth_headers(token)

      expect(response).to have_http_status(:ok)

      messages = json["messages"]
      expect(messages.length).to eq(2)
      expect(messages[0]["body"]).to eq("newer")
      expect(messages[1]["body"]).to eq("older")
    end
  end

  describe "POST /api/messages" do
    it "returns 422 when missing required fields" do
      token = login_and_get_token(email: "test@example.com", password: "password123!")

      post "/api/messages", params: { to_number: "" }, headers: auth_headers(token)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 502 when Twilio service raises" do
      token = login_and_get_token(email: "test@example.com", password: "password123!")
      allow(TwilioSendSmsService).to receive(:call).and_raise(StandardError.new("boom"))

      post "/api/messages",
           params: { to_number: "15551234567", body: "hi" },
           headers: auth_headers(token)

      expect(response).to have_http_status(:bad_gateway)
    end
  end


  private

  def json
    JSON.parse(response.body)
  rescue JSON::ParserError
    {}
  end
end
