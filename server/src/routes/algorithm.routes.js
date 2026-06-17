import { Router } from "express"
import 
{
  runBFS,
  runDFS,
  runDijkstra,
  runBellmanFord,
  runPrim,
  runKruskal,
  runDistanceVector,
  runLinkState
} from '../controllers/algorithm.controller.js'


const router = Router()

//bfs
router.route('/bfs').post(runBFS)

//dfs
router.route('/dfs').post(runDFS)

//dijkstra
router.route('/dijkstra').post(runDijkstra)

//bellmanFord
router.route('/bellmanFord').post(runBellmanFord)

//prim 
router.route('/prim').post(runPrim)

//kruskal
router.route('/kruskal').post(runKruskal)

//distanceVector 
router.route('/distanceVector').post(runDistanceVector)

//linkState
router.route('/linkState').post(runLinkState)

export default router
