require "rails_helper"

RSpec.describe Message, type: :model do
  before do
    ENV["TWILIO_FROM_NUMBER"] ||= "15551230000"
  end

  it "normalizes phone number to E.164 format" do
    msg = Message.new(to_number: "+1 (555) 123-4567")
    msg.valid?
    expect(msg.to_number).to eq("+15551234567")
  end

  it "rejects numbers without a leading +" do
    msg = Message.new(to_number: "15551234567")
    msg.valid?
    expect(msg.errors[:to_number]).to be_present
  end

end
