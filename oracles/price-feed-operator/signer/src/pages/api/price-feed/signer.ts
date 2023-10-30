import type { NextApiRequest, NextApiResponse } from 'next'
 
type ResponseSignerData = {
  
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseSignerData>
) {
  res.status(200).json({ })
}