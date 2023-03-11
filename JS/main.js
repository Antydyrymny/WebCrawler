// Program flow:
// initialize new crawler with input URL
// checks URL for validity, returns if unvalid
// create InnerNode from URL, save reference to it as treeObj
// creates visited set, adds URL to it
// creates toVisit array, push treeObj there
// while toVisit is not empty do:
//      shift node as currentlyVisiting
//      if node.link is in visited or if node is Outer continue
//      add node.link to visited
//          try to fetch link, if fail continue
//          try to process response as text, if fail continue
//          generate DOM from response, get all a tags from it
//          iterate all the <a> tags, get their href and check it for validity
//      get an array containedNodes with all valid links if same domain as InnerNode, otherwise as OuterNode
//      connect currentlyVisiting with all nodes from containedNodes
// after the iteration over toVisti is over returns treeObj

// const currentSite = new Crawler(url)
