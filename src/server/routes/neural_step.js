const { Router } = require('express')
const NeuralStepController = require('../controllers/neural_step')

const NeuralStepRouter = Router()

NeuralStepRouter.get('/neural_step', NeuralStepController.NeuralStepList)

module.exports = NeuralStepRouter