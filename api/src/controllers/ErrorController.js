import HttpError from "../utils/HttpError.js";

class ErrorController {
  errorHandler = async (err, req, res, next) => {
    // instanceof : est-ce que err est une instance de HttpError ?
    // retourne un bool vrai si err est une instance de HttpError
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        status: "error",
        statusCode: err.statusCode, // statusCode est spécifique à HttpError
        message: err.message,
      });
    }

    // **Erreur inattendue**
    // MESSAGE complet en interne : contexte de la route (méthode + URL) + détail de l'erreur
    // si err.parent existe: récupérer le message du parent --> err.parent?.message
    // dans le cas d'une erreur SQL err.parent.message contient l'erreur SQL
    // si err.parent n'existe pas, alors récupérer le message de err --> ?? err.message
    console.error(`Erreur sur ${req.method} ${req.originalUrl} :`, err.parent?.message ?? err.message);

    // MESSAGE générique au client
    res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Erreur interne du serveur.",
    });
  };

  route404 = async (req, res, next) => {
    // Traite le cas de la 404
    throw new HttpError("Url non trouvée", 404);
  };
}

export default new ErrorController();
