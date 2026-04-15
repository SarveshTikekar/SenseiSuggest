import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addAnime, // This function in api.js and backend must be updated for new payload
  deleteAnime,
  addGenre,
  addSeason,
  getAllGenres,
  getAllSeasons,
  getAllAnime,
} from '../api';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const { userId, isAdmin } = useAuth();
  const navigate = useNavigate();

  // State for Add Anime Form (UPDATED based on Anime Model)
  const [animeName, setAnimeName] = useState(''); // Renamed from 'title'
  const [genreId, setGenreId] = useState(''); // Still single select, sent as array
  const [seasonId, setSeasonId] = useState(''); // Still single select, sent as array (for release season)
  // Removed: locationId, year, episodes, origin as they are not in the provided Anime model
  const [description, setDescription] = useState('');
  const [image_url_base_anime, setImage_url_base_anime] = useState(''); // Renamed from 'imageUrl'
  const [releaseDate, setReleaseDate] = useState('');
  const [studio, setStudio] = useState('');
  const [status, setStatus] = useState(''); // Used to derive is_running
  const [isAdultRated, setIsAdultRated] = useState(false);
  const [trailer_url_base_anime, setTrailer_url_base_anime] = useState(''); // Renamed from 'trailerUrl'

  // State for Delete Anime Form
  const [deleteAnimeId, setDeleteAnimeId] = useState('');

  // State for Add Genre Form
  const [newGenreName, setNewGenreName] = useState('');

  // State for Add New Season Form
  const [selectedAnimeIdForSeason, setSelectedAnimeIdForSeason] = useState('');
  const [newSeasonNumber, setNewSeasonNumber] = useState('');
  const [newSeasonTitle, setNewSeasonTitle] = useState('');
  const [newSeasonInfo, setNewSeasonInfo] = useState('');
  const [newSeasonTrailer, setNewSeasonTrailer] = useState('');
  const [newSeasonImage, setNewSeasonImage] = useState('');


  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [genres, setGenres] = useState([]);
  const [seasons, setSeasons] = useState([]); // These are 'Release Seasons' (e.g., Fall 2023), not anime-specific seasons
  const [allAnime, setAllAnime] = useState([]);

  const fetchAdminData = useCallback(async () => {
    if (!userId || !isAdmin) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const [genresData, seasonsData, animeListData] = await Promise.all([
        getAllGenres(),
        getAllSeasons(),
        getAllAnime(),
      ]);
      setGenres(genresData);
      setSeasons(seasonsData);
      setAllAnime(animeListData);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setDataLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
    fetchAdminData();
  }, [isAdmin, navigate, fetchAdminData]);

  // UPDATED: handleAddAnimeSubmit with new fields and adjusted types for model
  const handleAddAnimeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // Map string 'status' to boolean 'is_running' as per Anime model
    const isRunningStatus = status === "Currently Airing" || status === "On Hiatus";

    const animeData = {
      animeName: animeName, // Matches model field name
      genres: genreId ? [parseInt(genreId)] : [], // Send as array of integers
      is_adult_rated: isAdultRated, // Matches model field name
      is_running: isRunningStatus, // Mapped from status string
      releaseDate: releaseDate, // Matches model field name
      seasons: seasonId ? [parseInt(seasonId)] : [], // Send as array of integers (for release seasons)
      description: description, // Matches model field name
      image_url_base_anime: image_url_base_anime, // Matches model field name
      trailer_url_base_anime: trailer_url_base_anime, // Matches model field name
      studio: studio, // Matches model field name
    };

    // Basic validation for required fields according to your model
    if (!animeName || !genreId || !releaseDate || !description || !studio || !status) {
      setError('Please fill in all required anime fields: Anime Name, Genre, Release Date, Description, Studio, and Status.');
      setLoading(false);
      return;
    }

    try {
      // Backend addAnime function needs to be updated to accept this comprehensive payload
      const response = await addAnime(animeData, userId);
      setMessage(`Anime '${response.animeName || animeName}' added successfully!`);
      resetAddAnimeForm();
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to add anime.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnime = async (animeId) => {
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await deleteAnime(parseInt(animeId), userId);
      setMessage(response.message);
      if (deleteAnimeId === animeId.toString()) {
        setDeleteAnimeId('');
      }
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete anime.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await addGenre({ name: newGenreName });
      setMessage(response.message);
      setNewGenreName('');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to add genre.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeason = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const seasonData = {
      animeId: parseInt(selectedAnimeIdForSeason),
      seasonNumber: parseInt(newSeasonNumber),
      seasonName: newSeasonTitle,
      seasonInfo: newSeasonInfo,
      seasonTrailer: newSeasonTrailer,
      seasonImage: newSeasonImage,
    };

    if (!selectedAnimeIdForSeason || isNaN(seasonData.animeId) || !newSeasonNumber || isNaN(seasonData.seasonNumber) || !newSeasonTitle.trim()) {
      setError('Please fill in all required season fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await addSeason(seasonData);
      setMessage(`Season '${response.seasonName || newSeasonTitle}' for Anime ID ${response.animeId || selectedAnimeIdForSeason} added successfully!`);
      resetAddSeasonForm();
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to add season.');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: resetAddAnimeForm to clear fields according to Anime model
  const resetAddAnimeForm = () => {
    setAnimeName('');
    setGenreId('');
    setSeasonId('');
    // Removed: setLocationId(''); setYear(''); setEpisodes(''); setOrigin('');
    setDescription('');
    setImage_url_base_anime('');
    setReleaseDate('');
    setStudio('');
    setStatus('');
    setIsAdultRated(false);
    setTrailer_url_base_anime('');
  };

  const resetAddSeasonForm = () => {
    setSelectedAnimeIdForSeason('');
    setNewSeasonNumber('');
    setNewSeasonTitle('');
    setNewSeasonInfo('');
    setNewSeasonTrailer('');
    setNewSeasonImage('');
  };

  if (!isAdmin) {
    return (
      <div className="text-center p-4 text-anime-error text-2xl my-12">
        Access Denied. You must be an administrator to view this page.
      </div>
    );
  }

  return (
    <div className="ss-card p-8 rounded-[2rem] border border-white/10 max-w-7xl mx-auto my-8 bg-white/[0.03] backdrop-blur-md">
      <h2 className="text-4xl font-display font-black text-[#DD0426] text-center mb-10 tracking-tight">Admin <span className="text-[#F5EBE0] italic">Terminal.</span></h2>

      {message && <p className="text-anime-success text-center mb-4 text-lg">{message}</p>}
      {error && <p className="text-anime-error text-center mb-4 text-lg">{error}</p>}

      {dataLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-anime-accent text-xl">Loading admin data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Add New Anime Form (UPDATED FIELDS FOR ANIME MODEL) */}
          <div className="p-6 rounded-2xl border border-white/10 shadow-md col-span-full md:col-span-1 bg-black/20">
            <h3 className="text-xl font-display font-black text-[#DD0426] mb-6 uppercase tracking-wider">Deploy Anime</h3>
            <form onSubmit={handleAddAnimeSubmit} className="space-y-4">
              <div>
                <label htmlFor="animeName" className="block text-anime-text-light text-sm font-bold mb-1">Anime Name:</label>
                <input type="text" id="animeName" value={animeName} onChange={(e) => setAnimeName(e.target.value)} required className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
              </div>
              <div>
                <label htmlFor="genreId" className="block text-anime-text-light text-sm font-bold mb-1">Genre:</label>
                <select id="genreId" value={genreId} onChange={(e) => setGenreId(e.target.value)} required className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light">
                  <option value="">Select a Genre</option>
                  {genres.map(g => <option key={g.genreId} value={g.genreId}>{g.name} (ID: {g.genreId})</option>)}
                </select>
              </div>
              {/* Removed Location ID, Year, Episodes, Origin as they are not in the Anime model */}
              <div>
                <label htmlFor="description" className="block text-anime-text-light text-sm font-bold mb-1">Description:</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"></textarea>
              </div>
              <div>
                <label htmlFor="image_url_base_anime" className="block text-anime-text-light text-sm font-bold mb-1">Image URL (Optional):</label>
                <input type="url" id="image_url_base_anime" value={image_url_base_anime} onChange={(e) => setImage_url_base_anime(e.target.value)} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" placeholder="https://example.com/anime.jpg"/>
              </div>

              <div>
                <label htmlFor="releaseDate" className="block text-anime-text-light text-sm font-bold mb-1">Release Date:</label>
                <input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
              </div>
              <div>
                <label htmlFor="studio" className="block text-anime-text-light text-sm font-bold mb-1">Studio:</label>
                <input type="text" id="studio" value={studio} onChange={(e) => setStudio(e.target.value)} required className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" placeholder="e.g., Toei Animation"/>
              </div>
              <div>
                <label htmlFor="status" className="block text-anime-text-light text-sm font-bold mb-1">Status:</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light">
                  <option value="">Select Status</option>
                  <option value="Currently Airing">Currently Airing</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hiatus">On Hiatus</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isAdultRated" checked={isAdultRated} onChange={(e) => setIsAdultRated(e.target.checked)} className="mr-2 h-4 w-4 text-anime-accent rounded border-gray-300 focus:ring-anime-accent" />
                <label htmlFor="isAdultRated" className="text-anime-text-light text-sm font-bold">Adult Rated?</label>
              </div>
              <div>
                <label htmlFor="trailer_url_base_anime" className="block text-anime-text-light text-sm font-bold mb-1">Trailer URL (Optional):</label>
                <input type="url" id="trailer_url_base_anime" value={trailer_url_base_anime} onChange={(e) => setTrailer_url_base_anime(e.target.value)} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" placeholder="http://youtube.com/watch?v=..." />
              </div>

              <button
                type="submit"
                className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Add Anime'}
              </button>
            </form>
          </div>

          {/* Delete Anime Form */}
          <div className="p-6 rounded-2xl border border-white/10 shadow-md col-span-full md:col-span-1 bg-black/20">
            <h3 className="text-xl font-display font-black text-[#DD0426] mb-6 uppercase tracking-wider">Purge Node</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleDeleteAnime(deleteAnimeId); }} className="space-y-4">
              <div>
                <label htmlFor="deleteAnimeId" className="block text-anime-text-light text-sm font-bold mb-1">Anime ID to Delete:</label>
                <input
                  type="number"
                  id="deleteAnimeId"
                  value={deleteAnimeId}
                  onChange={(e) => setDeleteAnimeId(e.target.value)}
                  required
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                  placeholder="Enter Anime ID"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-anime-error hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Anime'}
              </button>
            </form>
          </div>

          {/* Add Genre Form */}
          <div className="p-6 rounded-2xl border border-white/10 shadow-md bg-black/20">
            <h3 className="text-xl font-display font-black text-[#DD0426] mb-6 uppercase tracking-wider">Inject Genre</h3>
            <form onSubmit={handleAddGenre} className="space-y-4">
              <div>
                <label htmlFor="newGenreName" className="block text-anime-text-light text-sm font-bold mb-1">Genre Name:</label>
                <input
                  type="text"
                  id="newGenreName"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  required
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Genre'}
              </button>
            </form>
          </div>

          {/* Add Season Form */}
          <div className="p-6 rounded-2xl border border-white/10 shadow-md bg-black/20">
            <h3 className="text-xl font-display font-black text-[#DD0426] mb-6 uppercase tracking-wider">Link Season</h3>
            <form onSubmit={handleAddSeason} className="space-y-4">
              <div>
                <label htmlFor="animeIdForSeason" className="block text-anime-text-light text-sm font-bold mb-1">Link to Anime:</label>
                <select
                  id="animeIdForSeason"
                  value={selectedAnimeIdForSeason}
                  onChange={(e) => setSelectedAnimeIdForSeason(e.target.value)}
                  required
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                >
                  <option value="">Select an Anime</option>
                  {allAnime.map(anime => (
                    <option key={anime.animeId} value={anime.animeId}>{anime.animeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="newSeasonNumber" className="block text-anime-text-light text-sm font-bold mb-1">Season Number:</label>
                <input
                  type="number"
                  id="newSeasonNumber"
                  value={newSeasonNumber}
                  onChange={(e) => setNewSeasonNumber(e.target.value)}
                  required
                  min="1"
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                  placeholder="e.g., 1, 2, 3"
                />
              </div>
              <div>
                <label htmlFor="newSeasonTitle" className="block text-anime-text-light text-sm font-bold mb-1">Season Title (e.g., "The Final Arc"):</label>
                <input
                  type="text"
                  id="newSeasonTitle"
                  value={newSeasonTitle}
                  onChange={(e) => setNewSeasonTitle(e.target.value)}
                  required
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                  placeholder="e.g., Season 1, The Final Arc"
                />
              </div>
              <div>
                <label htmlFor="newSeasonInfo" className="block text-anime-text-light text-sm font-bold mb-1">Season Info/Description (Optional):</label>
                <textarea
                  id="newSeasonInfo"
                  value={newSeasonInfo}
                  onChange={(e) => setNewSeasonInfo(e.target.value)}
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                  placeholder="Brief description of the season"
                ></textarea>
              </div>
              <div>
                <label htmlFor="newSeasonTrailer" className="block text-anime-text-light text-sm font-bold mb-1">Season Trailer URL (Optional):</label>
                <input
                  type="url"
                  id="newSeasonTrailer"
                  value={newSeasonTrailer}
                  onChange={(e) => setNewSeasonTrailer(e.target.value)}
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label htmlFor="newSeasonImage" className="block text-anime-text-light text-sm font-bold mb-1">Season Image URL (Optional):</label>
                <input
                  type="url"
                  id="newSeasonImage"
                  value={newSeasonImage}
                  onChange={(e) => setNewSeasonImage(e.target.value)}
                  className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                  placeholder="https://example.com/season_image.jpg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Season'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* List All Anime Section */}
      <div className="p-6 rounded-2xl border border-white/10 shadow-md mt-12 bg-black/20">
        <h3 className="text-xl font-display font-black text-[#DD0426] mb-8 uppercase tracking-wider">Neural Library Index</h3>
        {allAnime.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-anime-border text-anime-text-light">
              <thead className="bg-anime-sub-card">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-anime-accent uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-anime-accent uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-anime-accent uppercase tracking-wider">Genre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-anime-accent uppercase tracking-wider">Season</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-anime-accent uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-anime-accent uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anime-border">
                {allAnime.map((anime) => (
                  <tr key={anime.animeId} className="hover:bg-anime-card-light">
                    <td className="px-6 py-4 whitespace-nowrap">{anime.animeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-anime-text-dark">{anime.animeName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Displaying first genre if available for simplicity in table */}
                      {anime.genres && anime.genres.length > 0 ? (genres.find(g => g.genreId === anime.genres[0])?.name || 'N/A') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {/* Displaying first season if available for simplicity in table */}
                       {anime.seasons && anime.seasons.length > 0 ? (seasons.find(s => s.seasonId === anime.seasons[0])?.name || 'N/A') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(anime.releaseDate).getFullYear() || 'N/A'}</td> {/* Extract year from releaseDate */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm(`Are you sure you want to delete "${anime.animeName}" (ID: ${anime.animeId})?`)) {
                            handleDeleteAnime(anime.animeId);
                          }
                        }}
                        className="text-anime-error hover:text-red-700 transition duration-150 ease-in-out"
                        disabled={loading}
                      >
                        {loading && deleteAnimeId === anime.animeId.toString() ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-anime-text-dark">No anime found. Add some using the form above!</p>
        )}
      </div>
    </div>
  );
}

export default AdminPage;