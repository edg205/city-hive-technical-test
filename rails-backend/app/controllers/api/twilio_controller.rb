class Api::TwilioController < ApplicationController
  # Twilio calls this endpoint; do not require JWT
  def status
    sid = params[:MessageSid]
    status = params[:MessageStatus]
    error_code = params[:ErrorCode]

    Message.where(twilio_sid: sid).first&.set(status: status, error_code: error_code)
    head :ok
  end
end
