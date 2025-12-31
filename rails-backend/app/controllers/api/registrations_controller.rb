class Api::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  # Make Devise/Warden stateless
  def sign_in(resource_or_scope, resource = nil, opts = {})
    opts[:store] = false
    super(resource_or_scope, resource, opts)
  end

  private

  def respond_with(resource, _opts = {})
    Rails.logger.info(resource.inspect)
    if resource.persisted?
      render json: { user: { id: resource.id.to_s, email: resource.email } }, status: :created
    else
      render json: { error: { message: "Validation failed", details: resource.errors.to_hash } }, status: :unprocessable_entity
    end
  end

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
