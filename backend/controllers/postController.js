const Post = require("../models/post");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");

exports.CreatePost = async (req, res, next) => {
    console.log(req.files);
    try {
      const {title, description,email} = req.body;
  
    let images = [];
  
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }
  
    let imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      let imageDataUri = images[i];
  
      try {
        const result = await cloudinary.v2.uploader.upload(imageDataUri, {
          folder: "posts",
        });
  
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      } catch (error) {
        console.log("Error uploading image:", error);
      }
    }
    images = imagesLinks;
      const newPost = new Post({ title, description, email, images });
  
      await newPost.save();
   
  
      res.status(200).json({ message: "Post Created Successfully" });
    } catch (error) {
      console.error("Error creating post", error);
      res.status(500).json({ message: "Creating Post Failed" });
    }
  };

  exports.userPosts = async (req, res, next) => {
    try {
        const email = req.params.email;
        
        // Find posts by the user's email
        const posts = await Post.find({ email: email });

        // Check if posts are found
        if (!posts || posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No posts found for this user."
            });
        }

        res.status(200).json({
            success: true,
            posts,  // Return posts in the response
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching posts.",
        });
    }
}
exports.AllUserPosts = async (req, res, next) => {
    try {
        // Use aggregation to join the Post collection with the User collection based on the email
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',       // The name of the User collection (in plural form)
                    localField: 'email', // Field in the Post collection to match
                    foreignField: 'email', // Field in the User collection to match
                    as: 'user'           // Alias for the joined data
                }
            },
            {
                $unwind: { 
                    path: '$user',      // Unwind the user array, since it will be an array of matched users
                    preserveNullAndEmptyArrays: true // Keep posts even if no user is found (optional)
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    email: 1,
                    images: 1,
                    userName: { $ifNull: ['$user.name', 'Unknown'] }, // Add the user's name or 'Unknown' if no user is found
                    userDp: { $ifNull: ['$user.dp', null] },
                    userRole: { $ifNull: ['$user.role', 'Unknown'] }           // Add the user's dp or null if no user is found
                }
            }
        ]);

        // Check if posts are found
        if (!posts || posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No posts found."
            });
        }

        res.status(200).json({
            success: true,
            posts,  // Return posts with user names and DPs included
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching posts.",
        });
    }
};

exports.getPostByUser = async (req, res, next) => {
    try {
     
      const posts = await Post.find({ _id: req.params.postId });
  
      if (!posts) {
        return res.status(404).json({
          success: false,
          message: "Posts not found",
        });
      }
      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  exports.updatePost = async (req, res) => {
    console.log(req.body)
    try {
      
      const { title, description, id } = req.body;
  
      // Find the user by the reset token
      const post = await Post.findOne({ _id: id });

      // Reset the user's password
      post.title = title;
      post.description = description;
      await post.save();
  
      res.status(200).json({ message: 'Update Post successfully' });
    } catch (error) {
      console.error('Error updating post :', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.deletePost = async (req, res) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      res.status(200).json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };