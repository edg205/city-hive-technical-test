class Api::TwilioController < ActionController::API
  # Twilio calls this endpoint; no JWT auth.
  # If you put everything else under ApplicationController with devise helpers,
  # keeping this as ActionController::API avoids auth filters.

  def status
    # Twilio sends these as form-encoded params by default
    sid        = params[:MessageSid]
    status     = params[:MessageStatus]
    error_code = params[:ErrorCode]

    return render json: { error: "missing MessageSid" }, status: :bad_request if sid.blank?

    msg = Message.where(twilio_sid: sid).first
    return head :ok if msg.nil? # don't 500 if we don't recognize it

    updates = { status: status }
    updates[:error_code] = error_code if error_code.present?

    msg.set(updates)
    head :ok
  end
end
