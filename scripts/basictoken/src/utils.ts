export const sections = [
  {
    header: 'Interact script',
    content: 'Deploy and Demo Tictactoe zkApp '
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'network',
        typeLabel: '{underline file}',
        description: 'lightnet'
      },
      {
        name: 'interact',
        description: 'deploy, play:demo'
      }
    ]
  }
]


export async function fetchTestGQL() {

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const operationsDoc = `
  query XyQuery {
    version
    account(publicKey: "B62qjnFHTRXgRNyAEgyH4dhaU93MshJUMtdRDrZgAqcyTfMgRkriH9Z") {
      nonce
      inferredNonce
      receiptChainHash
      delegate
      locked
      index
      zkappUri
      provedState
      tokenSymbol
      leafHash
      zkappState
    }
  }
`;

  var graphql = JSON.stringify({
    query: operationsDoc,
    variables: {}
  });

  // var graphql = JSON.stringify({
  //   query: "query Account {\n    account(publicKey: \"B62qjnFHTRXgRNyAEgyH4dhaU93MshJUMtdRDrZgAqcyTfMgRkriH9Z\") {\n        publicKey\n        tokenId\n        token\n        nonce\n        inferredNonce\n        receiptChainHash\n        delegate\n        votingFor\n        stakingActive\n        privateKeyPath\n        locked\n        index\n        zkappUri\n        zkappState\n        provedState\n        tokenSymbol\n        actionState\n        leafHash\n    }\n}\n",
  //   variables: {}
  // })
  var requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow'
  };

  const result = await fetch("http://localhost:8080/graphql", requestOptions);
  return await result.json();

}