import { randomUUID } from 'node:crypto'
import { Router } from "express";
import { readJSON } from '../utils.js'

import { validateMovie, validatePartialMovie } from '../schemas/movies.js'

const movies = readJSON('./movies.json')

export const moviesRouter = Router()

moviesRouter.get('/', (req, res) => {
    const { genre } = req.query
    if (genre) {
        const filteredMovies = moviesfilter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

moviesRouter.get('/:id', (res, req) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: "Movie Not Found" })
})

moviesRouter.post('/', (req, res) => {
    const result = validateMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: randomUUID(), // uuid v4
        ...result.data
    }

    movies.push(newMovie)

    res.status(201).json(newMovie)
})

moviesRouter.delete('/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie Not Found" })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: "Movie Deleted." })

})

moviesRouter.patch('/:id', (req, res) => {

    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (!movieIndex === -1) {
        return res.status(404).json({ message: "Movie Not Found" })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)

})