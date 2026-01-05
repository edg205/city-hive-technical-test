Rails.application.routes.draw do
  devise_for :users,
             defaults: { format: :json },
             path: "",
             path_names: {
               sign_in: 'login',
               sign_out: 'logout',
               registration: 'signup'
             },
             controllers: {
               sessions: "users/sessions",
               registrations: "users/registrations"
             }
  namespace :api do
    resources :messages, only: [:index, :create], defaults: { format: :json }
    post "twilio/status", to: "twilio#status", defaults: { format: :json }
  end
end
