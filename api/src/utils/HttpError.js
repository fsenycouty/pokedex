class HttpError extends Error {
  // Contient un code d'erreur
  #statusCode;

  constructor(message, code) {
    // Appel du constructeur de la classe parente Error
    super(message);

    // Appel du setter de status code
    this.statusCode = code;
  }

  get statusCode() {
    return this.#statusCode;
  }

  set statusCode(value) {
    this.#statusCode = Number.isInteger(value) ? value : 500;
  }
}

export default HttpError;
