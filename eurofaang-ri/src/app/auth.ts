export interface UserCredentials {
  username: string,
  password: string
}

export interface LoggedInUser {
  id: number,
  token: string,
  username: string
}

export const URL = "https://dcc-eurofaang-ri-be-4qewew6boq-nw.a.run.app";
