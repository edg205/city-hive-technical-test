class TwilioSendSmsService
  def self.call(to:, from:, body:, status_callback: nil)
    client = ::Twilio::REST::Client.new(
      ENV.fetch("TWILIO_ACCOUNT_SID"),
      ENV.fetch("TWILIO_AUTH_TOKEN")
    )

    attrs = { to: to, from: from, body: body }
    attrs[:status_callback] = status_callback if status_callback.present?

    message = client.messages.create(**attrs)
    { sid: message.sid, status: message.status || "queued" }
  end
end
