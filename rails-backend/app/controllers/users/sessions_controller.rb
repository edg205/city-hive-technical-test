module Users
  class SessionsController < Devise::SessionsController
    respond_to :json

    # POST /users/sign_in
    def create
      self.resource = warden.authenticate!(auth_options)
      sign_in(resource_name, resource, store: false) # <-- key line (no session)
      yield resource if block_given?

      render json: { user: { id: resource.id.to_s, email: resource.email } }, status: :ok
    end

    # DELETE /users/sign_out
    def destroy
      # With JWT denylist, devise-jwt will revoke based on the token.
      # We still avoid touching session.
      signed_out = sign_out(resource_name)
      head :no_content
    end

    private

    def respond_with(resource, _opts = {})
      render json: { user: { id: resource.id.to_s, email: resource.email } }, status: :ok
    end

    def respond_to_on_destroy
      head :no_content
    end
  end
end
