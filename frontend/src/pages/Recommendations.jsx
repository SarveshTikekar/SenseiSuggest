import React, { useState, useEffect, useCallback } from 'react';
import { getRecommendations } from '../api'; 
import { useAuth } from '../context/AuthContext'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RecommendationPage = () => {
  const { userId, username } = useAuth(); 
  const [recommendedAnimeDetails, setRecommendedAnimeDetails] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]); // Overall rating distribution
  const [genrePopularity, setGenrePopularity] = useState([]); // Overall genre popularity
  const [mostPopularAnime, setMostPopularAnime] = useState(null); // New state for the single most popular anime
  
  const [loading, setLoading] = useState(true); // Single loading state for all data
  const [error, setError] = useState(null); // Single error state for all data

  /**
   * Fetches all data (recommendations, rating distribution, genre popularity, most popular anime)
   * for the authenticated user from the backend's single endpoint.
   */
  const fetchAllData = useCallback(async () => {
    if (!userId) { 
      setRecommendedAnimeDetails([]); 
      setRatingDistribution([]);
      setGenrePopularity([]);
      setMostPopularAnime(null);
      setError("Please log in to view your personalized recommendations and analytics.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Call the single backend endpoint that returns all bundled data
      const response = await getRecommendations(userId); 
      
      // 1. Extract recommendations
      const recommendationsData = response.recommendations || [];
      setRecommendedAnimeDetails(recommendationsData.filter(Boolean)); 

      // 2. Extract and process ratings distribution
      const rawRatingsDistrib = response.ratings_distribution || {};
      // Ensure all scores from 1 to 10 are present, filling missing with 0 for chart consistency
      const processedRatingDistribution = Array.from({ length: 10 }, (_, i) => i + 1).map(score => ({
        score: score,
        count: rawRatingsDistrib[score] || 0
      }));
      setRatingDistribution(processedRatingDistribution);

      // 3. Extract and process genre popularity
      const rawGenreDistrib = response.Genre_anime_distrib || [];
      // Backend returns [{"GenreName": Count}, convert to {genreName: "GenreName", animeCount: Count}
      const processedGenrePopularity = rawGenreDistrib.map(item => {
        const genreName = Object.keys(item)[0]; // Get the single key (genre name)
        const animeCount = item[genreName];      // Get its value (count)
        return { genreName, animeCount };
      });
      setGenrePopularity(processedGenrePopularity);

      // 4. Extract Most Popular Anime
      const popularAnimeData = response.most_popular_anime || null;
      setMostPopularAnime(popularAnimeData);

    } catch (err) {
      console.error("Error fetching all data:", err);
      setError("Failed to fetch data. Please ensure the backend is running and data exists for your user. " + (err.response?.data?.detail || err.message));
      setRecommendedAnimeDetails([]);
      setRatingDistribution([]);
      setGenrePopularity([]);
      setMostPopularAnime(null);
    } finally {
      setLoading(false); 
    }
  }, [userId]); // Dependency array: fetchAllData re-runs if userId changes

  // Effect hook to trigger fetching all data when the component mounts or userId changes.
  useEffect(() => {
    fetchAllData(); 
  }, [fetchAllData]); // Dependency: re-run if fetchAllData (which depends on userId) changes

  return (
    <div className="bg-anime-card p-8 rounded-lg shadow-2xl border border-anime-border max-w-7xl mx-auto my-10 font-inter">
      <h2 className="text-5xl font-extrabold text-anime-accent text-center mb-10 tracking-wider">
        Your Sensei Suggest
      </h2>

      {/* Conditional rendering for logged-in vs. logged-out users */}
      {!userId ? (
        <div className="text-center p-8 bg-anime-bg rounded-lg border border-anime-border shadow-inner mb-10">
          <p className="text-anime-text-light text-2xl font-semibold">
            {error || "Log in to unlock your personalized anime recommendations and analytics!"}
          </p>
        </div>
      ) : (
        <>
          {/* User-specific recommendations header */}
          <div className="text-center p-8 bg-anime-bg rounded-lg border border-anime-border shadow-inner mb-10">
            <h3 className="text-3xl font-bold text-anime-accent mb-3">
              Recommendations for you
            </h3>
            <p className="text-anime-text-dark text-lg">
              Dive into a world of anime tailored just for you.
            </p>
            {error && <p className="text-anime-error mt-6 text-lg">{error}</p>}
          </div>

          {/* Recommendations list */}
          <div className="mb-12"> 
            <h3 className="text-3xl font-bold text-anime-accent mb-6 text-center">Your Curated Picks</h3>
            {loading && <p className="text-anime-text-light text-center text-xl animate-pulse">Loading amazing recommendations...</p>}
            {!loading && recommendedAnimeDetails.length === 0 && !error ? (
              <p className="text-anime-text-light text-center text-xl">
                No recommendations found for you yet. Rate more anime to help us understand your tastes!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {recommendedAnimeDetails.map((anime, index) => (
                  anime ? (
                    <div 
                      key={anime.animeId || index} 
                      className="bg-anime-bg p-4 rounded-lg border border-anime-border shadow-lg flex flex-col items-center text-center 
                                 transform hover:scale-105 hover:shadow-xl hover:border-anime-accent-dark transition duration-300 ease-in-out cursor-pointer"
                    >
                      <div className="relative w-44 h-44 flex-shrink-0 mb-4 rounded-md shadow-md border border-anime-border overflow-hidden">
                        <img
                          src={anime.image_url_base_anime || `https://placehold.co/176x176/16213E/9CA3AF?text=No+Image`}
                          alt={anime.animeName || 'Anime Image'}
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src=`https://placehold.co/176x176/16213E/9CA3AF?text=Image+Unavailable`; 
                          }}
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                      </div>

                      <h4 className="text-lg font-medium font-sans text-kawaii-text-dark tracking-wide mb-2 truncate w-full px-2">{anime.animeName || 'Unknown Anime'}</h4>
                      <p className="text-kawaii-text-muted text-sm italic mb-2">{anime.studio || 'N/A'}</p>
                      <p className="text-anime-text-light text-sm line-clamp-3 overflow-hidden text-ellipsis px-2 mb-3">
                        {anime.description ? `${anime.description.substring(0, 120)}${anime.description.length > 120 ? '...' : ''}` : 'No description available.'}
                      </p>
                      <div className="mt-auto text-sm text-anime-text-dark w-full">
                        <p className="bg-anime-border rounded-sm px-3 py-1 mb-1 inline-block"> 
                          <strong>Genres:</strong> {anime.genres && anime.genres.length > 0 ? anime.genres.map(g => `G${g}`).join(', ') : 'N/A'}
                        </p>
                        <p><strong>Release:</strong> {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      key={`placeholder-${index}`} 
                      className="bg-anime-bg p-4 rounded-lg border border-anime-border shadow-md flex flex-col items-center justify-center text-center text-anime-text-light min-h-[300px]"
                    >
                      <div className="relative w-44 h-44 flex-shrink-0 mb-4 rounded-md shadow-md border border-anime-border overflow-hidden flex items-center justify-center">
                          <span className="text-anime-text-dark text-center">No Image</span>
                      </div>
                      <p className="text-lg opacity-70">No recommendation available at this slot.</p>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Overall Genre Popularity Chart */}
            <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md">
              <h3 className="text-2xl font-bold text-anime-accent text-center mb-4">Overall Genre Popularity</h3>
              {loading && <p className="text-anime-text-light text-center">Loading genre data...</p>}
              {!loading && genrePopularity.length === 0 && !error ? (
                <p className="text-anime-text-light text-center">No overall genre popularity data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={genrePopularity}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis dataKey="genreName" stroke="#edf2f7" tick={{ fill: '#edf2f7', fontSize: 12 }} angle={-45} textAnchor="end" height={80} interval={0} />
                    <YAxis stroke="#edf2f7" tick={{ fill: '#edf2f7' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(74, 85, 104, 0.5)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', color: '#edf2f7' }}
                      itemStyle={{ color: '#edf2f7' }}
                    />
                    <Legend wrapperStyle={{ color: '#edf2f7', paddingTop: '10px' }} />
                    <Bar dataKey="animeCount" fill="#9f7aea" name="Number of Anime" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Overall Rating Distribution Chart */}
            <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md col-span-1 lg:col-span-1"> 
              <h3 className="text-2xl font-bold text-anime-accent text-center mb-4">Overall Rating Distribution</h3>
              {loading && <p className="text-anime-text-light text-center">Loading rating data...</p>}
              {!loading && ratingDistribution.length === 0 && !error ? (
                <p className="text-anime-text-light text-center">No rating distribution data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={ratingDistribution}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis dataKey="score" stroke="#edf2f7" tick={{ fill: '#edf2f7' }} />
                    <YAxis stroke="#edf2f7" tick={{ fill: '#edf2f7' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(74, 85, 104, 0.5)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', color: '#edf2f7' }}
                      itemStyle={{ color: '#edf2f7' }}
                    />
                    <Legend wrapperStyle={{ color: '#edf2f7', paddingTop: '10px' }} />
                    <Bar dataKey="count" fill="#4299e1" name="Number of Ratings" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Most Popular Anime Section (New) */}
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-anime-accent mb-6 text-center">Most Popular Anime Overall</h3>
            {loading && <p className="text-anime-text-light text-center">Loading most popular anime...</p>}
            {!loading && !mostPopularAnime && !error ? (
              <p className="text-anime-text-light text-center">No most popular anime data available.</p>
            ) : (
              mostPopularAnime && (
                <div className="flex flex-col md:flex-row items-center bg-anime-bg p-6 rounded-lg border border-anime-border shadow-lg mx-auto max-w-2xl">
                  <div className="relative w-48 h-48 flex-shrink-0 mb-4 md:mb-0 md:mr-6 rounded-md shadow-md border border-anime-border overflow-hidden">
                    <img
                      src={mostPopularAnime.image_url_base_anime || `https://placehold.co/192x192/16213E/9CA3AF?text=No+Image`}
                      alt={mostPopularAnime.animeName || 'Most Popular Anime'}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src=`https://placehold.co/192x192/16213E/9CA3AF?text=Image+Unavailable`; 
                      }}
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-center md:text-left flex-grow">
                    <h4 className="text-2xl font-semibold font-sans text-kawaii-text-dark tracking-wide mb-2">{mostPopularAnime.animeName || 'Unknown Anime'}</h4>
                    <p className="text-anime-text-light text-lg mb-2">
                      Release Year: <span className="font-semibold">{mostPopularAnime.releaseDate ? new Date(mostPopularAnime.releaseDate).getFullYear() : 'N/A'}</span>
                    </p>
                    <p className="text-anime-text-light text-lg mb-2">
                      Positivity: <span className="font-bold text-green-400">{mostPopularAnime["Positivity Percentage"] ? `${mostPopularAnime["Positivity Percentage"].toFixed(2)}%` : 'N/A'}</span>
                    </p>
                    {/* Add more details if available in your backend's most_popular_anime response */}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendationPage;