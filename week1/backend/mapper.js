export class MovieMapper {
  static #arrayFields = [
    'genres',
    'production_companies',
    'production_countries',
    'spoken_languages',
    'keywords'
  ];

  // DTO key -> DB key
  static #dtoToDbMap = {
    rating: 'vote_average',
    year: 'release_date',
    description: 'overview',
    title: 'title',
    vote_count: 'vote_count',
    status: 'status',
    revenue: 'revenue',
    runtime: 'runtime',
    adult: 'adult',
    budget: 'budget',
    imdb_id: 'imdb_id',
    original_language: 'original_language',
    original_title: 'original_title',
    popularity: 'popularity',
    tagline: 'tagline',
    genres: 'genres',
    production_companies: 'production_companies',
    production_countries: 'production_countries',
    spoken_languages: 'spoken_languages',
    keywords: 'keywords'
  };

  static #dbToDtoMap = Object.fromEntries(
    Object.entries(MovieMapper.#dtoToDbMap).map(([dtoKey, dbKey]) => [dbKey, dtoKey])
  );

  // Generic mapping: DB record -> entity or DTO
  static mapDbToObject(dbMovie, toDto = false) {
    const map = toDto ? this.#dbToDtoMap : null;
    const obj = { id: dbMovie.id };

    for (const key in dbMovie) {
      let targetKey = toDto ? map[key] : key;
      if (!targetKey) continue;

      let value = dbMovie[key];

      // Normalize arrays if mapping to DTO
      if (toDto && this.#arrayFields.includes(targetKey)) {
        value = this.#commaTextToArray(value);
      }

      obj[targetKey] = value;
    }

    return obj;
  }

  // Generic mapping: DTO -> entity or DB
  static mapDtoToObject(dto, toDb = false) {
    const map = toDb ? this.#dtoToDbMap : null;
    const obj = { };
    
    for (const key in dto) {
      if (dto[key] === undefined) continue;

      const targetKey = toDb ? map[key] || key : key;
      let value = dto[key];

      // Convert arrays to comma if mapping to DB
      if (toDb && this.#arrayFields.includes(key)) {
        value = this.#arrayToComma(value);
      }

      obj[targetKey] = value;
    }

    return obj;
  }


  // helpers for normalization 
  static #commaTextToArray(text) {
    if (!text || typeof text !== 'string') return [];
    return text.split(',').map(v => v.trim()).filter(Boolean);
  }

  static #arrayToComma(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(v => v.trim()).filter(Boolean).join(', ');
  }
}
