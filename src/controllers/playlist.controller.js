import mongoose, {isValidObjectId} from "mongoose"
import {playlist} from "../models/playlist.model.js"
import {Apierror} from "../utils/Apierror.js"
import {Apires} from "../utils/Apires.js"
import {asynchandler} from "../utils/asynchandler.js"


const createPlaylist = asynchandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new Apierror(400, "Name and description are required")
    }

    const newplist = await playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    })

    return res
    .status(201)
    .json(new Apires(201, newplist, "Playlist created successfully"))
})


const getUserPlaylists = asynchandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new Apierror(400, "Invalid user id")
    }

    const playlists = await playlist.find({ owner: userId })
        .populate("videos", "title thumbnail duration views")

    return res
    .status(200)
    .json(new Apires(200, playlists, "User playlists fetched successfully"))
})


const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new Apierror(400, "Invalid playlist id")
    }

    const foundPlaylist = await playlist.findById(playlistId)
        .populate("videos", "title thumbnail duration views owner")
        .populate("owner", "username fullname avatar")

    if(!foundPlaylist){
        throw new Apierror(404, "Playlist not found")
    }

    return res
    .status(200)
    .json(new Apires(200, foundPlaylist, "Playlist fetched successfully"))
})


const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new Apierror(400, "Invalid playlist or video id")
    }

    const foundPlaylist = await playlist.findById(playlistId)

    if(!foundPlaylist){
        throw new Apierror(404, "Playlist not found")
    }

    if(foundPlaylist.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403, "Only the owner can add videos to this playlist")
    }

    const updatedPlaylist = await playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },
        { new: true }
    )

    return res
    .status(200)
    .json(new Apires(200, updatedPlaylist, "Video added to playlist successfully"))
})


const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new Apierror(400, "Invalid playlist or video id")
    }

    const foundPlaylist = await playlist.findById(playlistId)

    if(!foundPlaylist){
        throw new Apierror(404, "Playlist not found")
    }

    if(foundPlaylist.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403, "Only the owner can remove videos from this playlist")
    }

    const updatedPlaylist = await playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    )

    return res
    .status(200)
    .json(new Apires(200, updatedPlaylist, "Video removed from playlist successfully"))
})


const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new Apierror(400, "Invalid playlist id")
    }

    const foundPlaylist = await playlist.findById(playlistId)

    if(!foundPlaylist){
        throw new Apierror(404, "Playlist not found")
    }

    if(foundPlaylist.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403, "Only the owner can delete this playlist")
    }

    await playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new Apires(200, {}, "Playlist deleted successfully"))
})


const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new Apierror(400, "Invalid playlist id")
    }

    if(!name && !description){
        throw new Apierror(400, "Provide name or description to update")
    }

    const foundPlaylist = await playlist.findById(playlistId)

    if(!foundPlaylist){
        throw new Apierror(404, "Playlist not found")
    }

    if(foundPlaylist.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403, "Only the owner can update this playlist")
    }

    const updatedPlaylist = await playlist.findByIdAndUpdate(
        playlistId,
        { $set: { name, description } },
        { new: true }
    )

    return res
    .status(200)
    .json(new Apires(200, updatedPlaylist, "Playlist updated successfully"))
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}