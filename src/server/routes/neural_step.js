const { Router } = require('express')
const NeuralStepController = require('../controllers/neural_step/neural_step')

const NeuralStepRouter = Router()

NeuralStepRouter.get('/', NeuralStepController.NeuralStepList)

module.exports = NeuralStepRouter