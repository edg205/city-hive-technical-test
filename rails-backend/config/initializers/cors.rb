# Be sure to restart your server when you modify this file.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Frontend origin (Angular dev server)
    origins "http://localhost:4200"

    resource "*",
             headers: :any,
             expose: [
               "Authorization" # allow frontend to READ the JWT header
             ],
             methods: [
               :get,
               :post,
               :put,
               :patch,
               :delete,
               :options,
               :head
             ]
  end
end
