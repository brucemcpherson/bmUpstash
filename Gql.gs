class Gql {
  // fetcher should include auth setup
  constructor ({fetcher, url}) {
    this.fetcher = fetcher
    this.url = url
  }

  execute (command, ...vargs) {
    const payload = this['redis'+command](...vargs)
    console.log(payload)
    const result = this.fetcher (this.url, {
      method:'POST',
      contentType: "application/json",
      payload: JSON.stringify(payload)
    })
    return result
  }

  redisGet (key) {
    return {
      query: `query($key: String!) {
        redisGet(key:$key)
      }`,
      variables: {
        key
      }
    }
  }
  
  redisSetEX (key, value, seconds) {
    return {
      query: `mutation($key: String!,$value:String!,seconds:Int!) {
        redisSetEX(key:$key, value:$value,seconds:$seconds)
      }`,
      variables: {
        key,
        value,
        seconds
      }
    }
  }

  redisDel (keys) {
    keys = Array.isArray(keys) ? keys : [keys]
    return {
      query: `mutation($keys: [String!]!) {
        redisDel(keys:$keys)
      }`,
      variables: {
        keys
      }
    }
  }

  redisSet (key, value) {
    return {
      query: `mutation($key: String!,$value:String!) {
        redisSet(key:$key, value:$value)
      }`,
      variables: {
        key,
        value
      }
    }
  }
}
function gqlRedis ({fetcher, tokenService, url = 'https://graphql-eu-west-1.upstash.io/'} ={})  {
  if (!fetcher) throw new Error (`Must specify a fetcher - for apps script it should probably be ${'U'}rlfetch.fetch`)
  if (!tokenService) throw new Error (`Must specify a tokenservice function - should return your upstash read or read/write access key eg () => rwkey`)
  // initialize the fetcher - we'll just steal the one from bmcrusher
  const f = new Fetcher({ fetcher, tokenService }).got
  return new Gql ({fetcher: f, url })
}
