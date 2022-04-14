import React, {Component} from 'react';
import Joke from './Joke'
import axios from 'axios'
import { v4 as uuidv4} from 'uuid'
import "./JokeList.css"

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  }
  constructor(props) {
    super(props);
    this.state = {
      joke: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    }
    this.seenJokes = new Set(this.state.joke.map(j => j.text))
    console.log(this.seenJokes)
    this.handleClick = this.handleClick.bind(this)
  }  

  componentDidMount() {
    if(this.state.joke.length === 0) this.getJokes()
  }

  async getJokes() {
    try {
    let jokes = []
    while(jokes.length < this.props.numJokesToGet) {
      let res = await axios.get('https://icanhazdadjoke.com/', {
        headers: {Accept: 'application/json'
      }})
      let newJoke = res.data.joke;
      if(!this.seenJokes.has(newJoke)) {
        jokes.push({id: uuidv4(), text: newJoke, vote: 0})
      } else {
        console.log("duplicate")
        console.log(newJoke)
      }
    }
    this.setState(st => ({
      loading: false,
      joke: [...st.joke, ...jokes]
    }),
      () => window.localStorage.setItem("jokes", JSON.stringify(this.state.joke))
    )
  } catch(e) {
    alert(e)
    this.setState({loading: false})
    }
  }

  handleVote(id, delta) {
    this.setState(st => ({
      joke: st.joke.map(j => 
        j.id === id ? {...j, vote: j.vote + delta} : j
      )
    }),
    () => window.localStorage.setItem("jokes", JSON.stringify(this.state.joke))
    )
  }

  handleClick() {
    this.setState({loading: true}, this.getJokes)
  }

  render() {
    if(this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin' />
          <h1 className='JokeList-title'>Loading...</h1>
        </div>
      )
    }
    let jokes = this.state.joke.sort((a,b) => b.vote - a.vote)
    return (
      <div className='JokeList'>
        <div className='JokeList-sidebar'>
          <h1 className="JokeList-title">
            <span>Dad </span>Jokes
          </h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className='JokeList-getmore' onClick={this.handleClick}>New Jokes</button>
        </div>
        
        <div className='JokeList-jokes'>
          {jokes.map(j => (
            <Joke 
            key={j.id}
            vote={j.vote}
            text={j.text}
            upvote={() => this.handleVote(j.id, 1)}
            downvote={() => this.handleVote(j.id, -1)}/>
          ))}
        </div>
      </div>
      );
  }
}

export default JokeList;