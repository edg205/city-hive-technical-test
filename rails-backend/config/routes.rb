Rails.application.routes.draw do
  namespace :api do
    devise_for :users,
               path: "",
               path_names: { sign_in: "login", sign_out: "logout", registration: "signup" },
               controllers: { sessions: "api/sessions", registrations: "api/registrations" },
               defaults: { format: :json }

    resources :messages, only: [:index, :create], defaults: { format: :json }
    post "twilio/status", to: "twilio#status", defaults: { format: :json }
  end
end
