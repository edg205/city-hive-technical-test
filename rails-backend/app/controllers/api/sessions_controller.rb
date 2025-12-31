class Api::SessionsController < Devise::SessionsController
  respond_to :json

  # Make Devise/Warden stateless
  def sign_in(resource_or_scope, resource = nil, opts = {})
    opts[:store] = false
    super(resource_or_scope, resource, opts)
  end

  private

  def respond_with(resource, _opts = {})
    render json: { user: { id: resource.id.to_s, email: resource.email } }, status: :ok
  end

  def respond_to_on_destroy
    head :no_content
  end
end
