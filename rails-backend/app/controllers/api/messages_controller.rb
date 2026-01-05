class Api::MessagesController < ApplicationController
  before_action :authenticate_user!

  def index
    messages = current_user.messages.order_by(created_at: :desc).limit(100)
    render json: { messages: messages.map { |m| serialize(m) } }
  end

  def create
    msg = current_user.messages.create!(
      to_number: params.require(:to_number),
      body: params.require(:body),
      from_number: ENV.fetch("TWILIO_FROM_NUMBER")
    )
    result = TwilioSendSmsService.call(
      to: msg.to_number,
      from: msg.from_number,
      body: msg.body,
      status_callback: ENV["TWILIO_STATUS_CALLBACK_URL"]
    )

    msg.set(twilio_sid: result[:sid], status: result[:status])
    render json: { message: serialize(msg) }, status: :created
  rescue ActionController::ParameterMissing => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue Mongoid::Errors::Validations => e
    render json: { errors: e.document.errors.to_hash }, status: :unprocessable_entity
  rescue StandardError => e
    render json: { error: e.message }, status: :bad_gateway
  end

  private

  def serialize(m)
    {
      id: m.id.to_s,
      to_number: m.to_number,
      from_number: m.from_number,
      body: m.body,
      twilio_sid: m.twilio_sid,
      status: m.status,
      error_code: m.error_code,
      created_at: m.created_at
    }
  end
end
