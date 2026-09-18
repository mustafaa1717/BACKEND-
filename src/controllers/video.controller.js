import mongoose, {isValidObjectId} from "mongoose"
import {video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Apierror} from "../utils/Apierror.js"
import {Apires} from "../utils/Apires.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    // If userId is provided and valid, use it; otherwise fall back to logged-in user
    const ownerId = userId && isValidObjectId(userId) ? userId : req.user._id

    const allvideos = await video.find({
        owner: ownerId,
    })

    if (!allvideos || allvideos.length === 0) {
        throw new Apierror(404, "no videos found")
    }

    return res
        .status(200)
        .json(new Apires(200, { allvideos }, "all videos fetched"))

})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description } = req.body

    if (!title || !description) {
        throw new Apierror(400, "title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new Apierror(400, "video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new Apierror(400, "thumbnail is required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoFileLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!uploadedVideo) {
        throw new Apierror(500, "failed to upload video")
    }

    if (!uploadedThumbnail) {
        throw new Apierror(500, "failed to upload thumbnail")
    }

    const newVideo = await video.create({
        videofile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        duration: uploadedVideo.duration,
        owner: req.user._id,
    })

    return res
        .status(201)
        .json(new Apires(201, { newVideo }, "video published successfully"))
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "invalid video id")
    }

    const videos = await video.findById(videoId)

    if (!videos) {
        throw new Apierror(404, "no video found")
    }

    return res
        .status(200)
        .json(new Apires(200, { videos }, "video sent successfully"))
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "invalid video id")
    }

    const videouser = await video.findById(videoId)

    if (!videouser) {
        throw new Apierror(404, "no such video exists")
    }

    if (videouser.owner.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "only the owner can update the video")
    }

    const { title, description } = req.body

    const updatevid = await video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new Apires(200, { updatevid }, "video has been updated"))

})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "invalid video id")
    }

    const existing = await video.findById(videoId)

    if (!existing) {
        throw new Apierror(404, "no such video exists")
    }

    if (existing.owner.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "only the owner can delete the video")
    }

    await video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new Apires(200, {}, "the video has been deleted"))

})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "invalid video id")
    }

    const state = await video.findById(videoId)

    if (!state) {
        throw new Apierror(404, "video not found")
    }

    state.ispublished = !state.ispublished

    const updatestate = await state.save()

    return res
        .status(200)
        .json(new Apires(200, { updatestate }, "publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
