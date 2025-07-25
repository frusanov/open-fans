import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { getDb, eq, desc } from '../utils/db.ts'
import { errors } from '../middleware/error-handler.ts'
import { readRateLimiter } from '../middleware/rate-limiter.ts'

const posts = new Hono()

// JWT Secret (should match auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Validation schemas (placeholders for future post schema)
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'followers', 'paid']).default('public'),
  price: z.number().min(0).optional(), // For paid content
})

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'followers', 'paid']).optional(),
  price: z.number().min(0).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
})

const searchPostsSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  tag: z.string().max(50).optional(),
  author: z.string().max(50).optional(),
  visibility: z.enum(['public', 'private', 'followers', 'paid']).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 50, 'Limit must be between 1 and 50').optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Offset must be 0 or greater').optional(),
})

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw errors.unauthorized('No token provided')
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Set user info in context
    c.set('userId', decoded.userId)
    c.set('username', decoded.username)
    c.set('userEmail', decoded.email)

    await next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw errors.unauthorized('Invalid token')
    }
    throw error
  }
}

// Optional auth middleware (sets user if token is present but doesn't require it)
const optionalAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, JWT_SECRET) as any
      c.set('userId', decoded.userId)
      c.set('username', decoded.username)
      c.set('userEmail', decoded.email)
    }
    await next()
  } catch (error) {
    // Ignore auth errors for optional auth
    await next()
  }
}

// Apply rate limiting to read operations
posts.use('/search', readRateLimiter)
posts.use('/:id', readRateLimiter)

// Get all posts (public endpoint with optional auth for personalization)
posts.get('/', optionalAuth, zValidator('query', searchPostsSchema), async (c) => {
  try {
    const { q, tag, author, visibility = 'public', limit = 20, offset = 0 } = c.req.valid('query')
    const userId = c.get('userId')

    // TODO: Replace with actual posts table when implemented
    // For now, return placeholder data
    const placeholderPosts = [
      {
        id: '1',
        title: 'Welcome to Open Fans',
        content: 'This is a placeholder post. The posts system will be implemented soon.',
        author: {
          id: 'system',
          username: 'system',
        },
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['announcement', 'platform'],
        likesCount: 0,
        commentsCount: 0,
        price: null,
      }
    ]

    return c.tson({
      posts: placeholderPosts,
      pagination: {
        limit,
        offset,
        total: 1,
        hasMore: false,
      },
      filters: {
        query: q,
        tag,
        author,
        visibility,
      }
    })

  } catch (error) {
    throw error
  }
})

// Get post by ID (public endpoint with optional auth)
posts.get('/:id', optionalAuth, async (c) => {
  try {
    const postId = c.req.param('id')
    const userId = c.get('userId')

    // TODO: Replace with actual database query
    if (postId === '1') {
      return c.tson({
        post: {
          id: '1',
          title: 'Welcome to Open Fans',
          content: 'This is a placeholder post. The posts system will be implemented soon. The actual implementation will include rich content support, media attachments, and proper access control.',
          author: {
            id: 'system',
            username: 'system',
          },
          visibility: 'public',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['announcement', 'platform'],
          likesCount: 0,
          commentsCount: 0,
          price: null,
          userHasAccess: true, // Will be calculated based on user permissions
          userHasLiked: false, // Will be calculated based on user interactions
        }
      })
    }

    throw errors.notFound('Post')

  } catch (error) {
    throw error
  }
})

// Create new post (protected)
posts.post('/', requireAuth, zValidator('json', createPostSchema), async (c) => {
  try {
    const postData = c.req.valid('json')
    const userId = c.get('userId')
    const username = c.get('username')

    // TODO: Replace with actual database insertion
    // For now, return placeholder response
    const newPost = {
      id: Date.now().toString(), // Temporary ID generation
      ...postData,
      author: {
        id: userId,
        username: username,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
    }

    return c.tson({
      message: 'Post created successfully',
      post: newPost,
    }, 201)

  } catch (error) {
    throw error
  }
})

// Update post (protected)
posts.patch('/:id', requireAuth, zValidator('json', updatePostSchema), async (c) => {
  try {
    const postId = c.req.param('id')
    const updates = c.req.valid('json')
    const userId = c.get('userId')

    // TODO: Replace with actual database operations
    // - Check if post exists
    // - Check if user owns the post
    // - Update the post

    return c.tson({
      message: 'Post updated successfully (placeholder)',
      postId,
      updates,
    })

  } catch (error) {
    throw error
  }
})

// Delete post (protected)
posts.delete('/:id', requireAuth, async (c) => {
  try {
    const postId = c.req.param('id')
    const userId = c.get('userId')

    // TODO: Replace with actual database operations
    // - Check if post exists
    // - Check if user owns the post
    // - Delete the post and related data (comments, likes, etc.)

    return c.tson({
      message: 'Post deleted successfully (placeholder)',
      postId,
    })

  } catch (error) {
    throw error
  }
})

// Like/unlike post (protected)
posts.post('/:id/like', requireAuth, async (c) => {
  try {
    const postId = c.req.param('id')
    const userId = c.get('userId')

    // TODO: Replace with actual like/unlike logic
    return c.tson({
      message: 'Post like toggled (placeholder)',
      postId,
      liked: true, // Will be calculated based on current state
    })

  } catch (error) {
    throw error
  }
})

// Get post comments (public endpoint with optional auth)
posts.get('/:id/comments', optionalAuth, async (c) => {
  try {
    const postId = c.req.param('id')
    const userId = c.get('userId')

    // TODO: Replace with actual comments query
    return c.tson({
      comments: [], // Placeholder
      postId,
      total: 0,
    })

  } catch (error) {
    throw error
  }
})

// Add comment to post (protected)
posts.post('/:id/comments', requireAuth, zValidator('json', z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(), // For threaded comments
})), async (c) => {
  try {
    const postId = c.req.param('id')
    const { content, parentId } = c.req.valid('json')
    const userId = c.get('userId')
    const username = c.get('username')

    // TODO: Replace with actual comment creation
    return c.tson({
      message: 'Comment added successfully (placeholder)',
      comment: {
        id: Date.now().toString(),
        content,
        author: {
          id: userId,
          username: username,
        },
        postId,
        parentId,
        createdAt: new Date().toISOString(),
      }
    }, 201)

  } catch (error) {
    throw error
  }
})

// Get user's own posts (protected)
posts.get('/me/posts', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')

    // TODO: Replace with actual user posts query
    return c.tson({
      posts: [], // Placeholder
      total: 0,
      userId,
    })

  } catch (error) {
    throw error
  }
})

// Get posts by user ID (public endpoint with optional auth)
posts.get('/user/:userId', optionalAuth, async (c) => {
  try {
    const targetUserId = c.req.param('userId')
    const currentUserId = c.get('userId')

    // TODO: Replace with actual user posts query
    // Consider visibility rules based on current user's relationship to target user
    return c.tson({
      posts: [], // Placeholder
      total: 0,
      authorId: targetUserId,
    })

  } catch (error) {
    throw error
  }
})

export { posts as postsRoutes }
