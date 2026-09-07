import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://projeto-de-analise-f85f2.goskip.app'
const pb = new PocketBase(pbUrl)
pb.autoCancellation(false)

export default pb
