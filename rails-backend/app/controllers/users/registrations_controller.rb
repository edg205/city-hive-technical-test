module Users
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    def create
      build_resource(sign_up_params)

      if resource.save
        sign_in(resource_name, resource, store: false)

        render json: { user: { id: resource.id.to_s, email: resource.email } }, status: :created
      else
        clean_up_passwords resource
        set_minimum_password_length
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
