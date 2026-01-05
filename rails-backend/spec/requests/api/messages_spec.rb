# spec/requests/api/messages_spec.rb
require "rails_helper"

RSpec.describe "API::Messages", type: :request do
  let!(:user) { User.create!(email: "test@example.com", password: "password123!") }

  before do
    # Your controller currently uses User.last, so make sure our user is the last.
    user

    # Prevent real Twilio calls
    allow(TwilioSendSmsService).to receive(:call).and_return(
      { sid: "SM_TEST_123", status: "queued" }
    )

    # Avoid needing a real env var in test
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("TWILIO_FROM_NUMBER").and_return("+15551234567")
  end

  describe "GET /api/messages" do
    it "returns an empty list when the user has no messages" do
      get "/api/messages"

      expect(response).to have_http_status(:ok)
      expect(json).to include("messages")
      expect(json["messages"]).to eq([])
    end

    it "returns the user's messages in reverse chronological order (max 100)" do
      m1 = user.messages.create!(to_number: "+15555550001", body: "older", from_number: "+15551234567")
      m2 = user.messages.create!(to_number: "+15555550002", body: "newer", from_number: "+15551234567")
      m1.update!(created_at: 2.days.ago)
      m2.update!(created_at: 1.day.ago)

      get "/api/messages"

      expect(response).to have_http_status(:ok)

      messages = json["messages"]
      expect(messages.length).to eq(2)
      expect(messages[0]["body"]).to eq("newer")
      expect(messages[1]["body"]).to eq("older")
    end
  end

  describe "POST /api/messages" do
    it "creates a message, calls Twilio service, and returns serialized message" do
      post "/api/messages", params: { to_number: "+15555551212", body: "Hello" }, as: :json

      expect(response).to have_http_status(:created)
      expect(TwilioSendSmsService).to have_received(:call).with(
        hash_including(
          to: "+15555551212",
          from: "+15551234567",
          body: "Hello"
        )
      )

      payload = json
      expect(payload).to include("message")

      msg = payload["message"]
      expect(msg["id"]).to be_present
      expect(msg["to_number"]).to eq("+15555551212")
      expect(msg["from_number"]).to eq("+15551234567")
      expect(msg["body"]).to eq("Hello")
      expect(msg["twilio_sid"]).to eq("SM_TEST_123")
      expect(msg["status"]).to eq("queued")
      expect(msg["created_at"]).to be_present

      # persisted
      record = Message.find(msg["id"])
      expect(record.user_id).to eq(user.id)
      expect(record.twilio_sid).to eq("SM_TEST_123")
      expect(record.status).to eq("queued")
    end

    it "returns 422 with validation details when missing required fields" do
      post "/api/messages", params: { to_number: "" }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)

      expect(json.dig("error", "message")).to eq("Validation failed")
      # details is a hash of field => errors
      details = json.dig("error", "details")
      expect(details).to be_a(Hash)
      expect(details.keys).to include("to_number", "body")
    end

    it "returns 502 and does not crash when Twilio service raises" do
      allow(TwilioSendSmsService).to receive(:call).and_raise(StandardError.new("Twilio down"))

      post "/api/messages", params: { to_number: "+15555551212", body: "Hello" }, as: :json

      expect(response).to have_http_status(:bad_gateway)
      expect(json.dig("error", "message")).to eq("Failed to send message")
      # (Optional) In prod you'd not return e.message, but your controller currently does.
      expect(json.dig("error", "details")).to include("Twilio down")
    end
  end

  private

  def json
    JSON.parse(response.body)
  rescue JSON::ParserError
    {}
  end
end
