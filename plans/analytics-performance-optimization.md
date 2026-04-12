# Analytics Performance Optimization Plan

## Problem Analysis
The analytics implementation has several performance bottlenecks that could slow down the site:

### 1. Heavy Database Queries on Admin Analytics Page
- Multiple `count()` operations on large tables
- N+1 query problem for unique session counts
- Monthly data queries in a loop (12 queries for 6 months)
- No pagination for potentially large datasets

### 2. Real-time Polling Overhead
- Polls every 30 seconds for live views
- Each poll triggers database queries
- Multiplies with concurrent admin users

### 3. Client-side Analytics Tracking
- Constant database writes from all users
- 30-second heartbeat creates frequent updates
- `beforeunload` events trigger final updates

### 4. Missing Optimizations
- No caching for static analytics data
- Missing composite indexes for common query patterns
- No query batching for related operations

## Optimization Priorities

### Priority 1: Critical Database Optimizations
1. **Fix N+1 query in top pages** - Combine unique session counting into main query
2. **Optimize monthly data queries** - Use single query with date ranges
3. **Add composite indexes** - For `(sessionId, path)` and `(provider, createdAt)`
4. **Implement query timeouts** - Prevent long-running queries

### Priority 2: Reduce Server Load
1. **Increase polling interval** - From 30s to 60s or 120s
2. **Implement incremental updates** - Only fetch new data since last poll
3. **Add request debouncing** - Prevent rapid consecutive refreshes
4. **Implement WebSocket/SSE** - For true real-time without polling

### Priority 3: Client-side Tracking Optimizations
1. **Reduce heartbeat frequency** - From 30s to 60s or only on significant events
2. **Implement batching** - Send multiple page views in single request
3. **Add sampling** - For high-traffic scenarios
4. **Use localStorage queue** - Buffer events during network issues

### Priority 4: Caching Strategy
1. **Cache static counts** - User counts, total views (5-10 minute TTL)
2. **Implement Redis caching** - For frequently accessed analytics
3. **Use CDN for public stats** - If displaying on public pages
4. **Precompute aggregates** - Daily/hourly summary tables

## Implementation Plan

### Phase 1: Quick Wins (1-2 days)
1. Fix N+1 query in top pages calculation
2. Optimize monthly data query loop
3. Add composite database indexes
4. Increase polling interval to 60s

### Phase 2: Medium-term Improvements (3-5 days)
1. Implement basic caching for static analytics
2. Add pagination to large result sets
3. Reduce client-side heartbeat frequency
4. Implement request debouncing

### Phase 3: Advanced Optimizations (1-2 weeks)
1. Set up Redis for analytics caching
2. Implement WebSocket/SSE for real-time updates
3. Create precomputed aggregate tables
4. Add analytics data retention policy

## Expected Performance Improvements

| Optimization | Expected Impact | Risk |
|-------------|----------------|------|
| Fix N+1 queries | 50-80% reduction in query count | Low |
| Add composite indexes | 70-90% faster query execution | Low |
| Increase polling interval | 50% reduction in server load | Low |
| Implement caching | 90% reduction in database reads | Medium |
| Reduce heartbeat frequency | 50% reduction in tracking writes | Low |

## Monitoring Plan
1. Add query performance logging
2. Monitor database CPU usage
3. Track page load times before/after
4. Set up alerts for slow queries

## Rollout Strategy
1. Test optimizations in staging environment
2. Deploy Phase 1 changes first
3. Monitor performance for 24-48 hours
4. Deploy subsequent phases with monitoring
5. A/B test if possible to measure impact

## Success Metrics
- Admin analytics page load time < 2 seconds
- Database query count reduced by 50%
- Server CPU usage normalized
- No timeouts on analytics queries
- User-reported performance improvements