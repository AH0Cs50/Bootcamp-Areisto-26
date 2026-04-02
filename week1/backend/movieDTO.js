export class MovieDTO {

  #update = false; 

  #dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{4}|\d{4})$/;

  // Arrays
  #arrayFields = [
    'genres',
    'production_companies',
    'production_countries',
    'spoken_languages',
    'keywords'
  ];

  // api data shape 
  constructor(body) {
    this.title = body.title;
    this.rating = body.rating;
    this.vote_count = body.vote_count;
    this.status = body.status;
    this.year = body.year;
    this.revenue = body.revenue;
    this.runtime = body.runtime;
    this.adult = body.adult;
    this.budget = body.budget;
    this.imdb_id = body.imdb_id;
    this.original_language = body.original_language;
    this.original_title = body.original_title;
    this.description = body.description;
    this.popularity = body.popularity;
    this.tagline = body.tagline;
    this.genres = body.genres;
    this.production_companies = body.production_companies;
    this.production_countries = body.production_countries;
    this.spoken_languages = body.spoken_languages;
    this.keywords = body.keywords;
  }

  //helpers
  #isNumber(value) { return typeof value === 'number' && !isNaN(value); }
  #isString(value) { return typeof value === 'string'; }
  #isBoolean(value) { return typeof value === 'boolean'; }
  #isArray(value) { return Array.isArray(value); }

  #validateRequired(field, name) {
    if (field === undefined || field === null || field === '') {
      throw new Error(`${name} is required`);
    }
  }

  validate() {
    // Only require fields for create, not update
    if (!this.#update) {
      this.#validateRequired(this.title, 'title');
      this.#validateRequired(this.rating, 'rating');
      this.#validateRequired(this.year, 'year');
    }

    // Type checks (only if field exists)
    if (this.title !== undefined && !this.#isString(this.title)) {
      throw new Error('title must be a string');
    }

    if (this.rating !== undefined && !this.#isNumber(this.rating)) {
      throw new Error('rating must be a number');
    }

    if (this.year !== undefined) {
      if (!(this.#isNumber(this.year) || this.#isString(this.year))) {
        throw new Error('year must be an integer or string');
      }

      if (this.#isString(this.year) && !this.#dateRegex.test(this.year)) {
        throw new Error('year string format not match the date format');
      }

      if (this.#isNumber(this.year) && (this.year < 1000 || this.year > 9999)) {
        throw new Error('year must be 4 digits');
      }
    }

    // Optional fields validation
    if (this.vote_count !== undefined && !this.#isNumber(this.vote_count)) {
      throw new Error('vote_count must be a number');
    }
    if (this.runtime !== undefined && !this.#isNumber(this.runtime)) {
      throw new Error('runtime must be a number');
    }
    if (this.revenue !== undefined && !this.#isNumber(this.revenue)) {
      throw new Error('revenue must be a number');
    }
    if (this.budget !== undefined && !this.#isNumber(this.budget)) {
      throw new Error('budget must be a number');
    }
    if (this.popularity !== undefined && !this.#isNumber(this.popularity)) {
      throw new Error('popularity must be a number');
    }
    if (this.adult !== undefined && !this.#isBoolean(this.adult)) {
      throw new Error('adult must be boolean');
    }
    if (this.description !== undefined && !this.#isString(this.description)) {
      throw new Error('description must be string');
    }
    if (this.tagline !== undefined && !this.#isString(this.tagline)) {
      throw new Error('tagline must be string');
    }

    for (const field of this.#arrayFields) {
      if (this[field] !== undefined && !this.#isArray(this[field])) {
        throw new Error(`${field} must be an array`);
      }
    }
  }

  #normalizeYear () {
    if (this.year === undefined) return;
    if (this.#isNumber(this.year)) {
      this.year = `00/00/${this.year}`; // the month and date unknown
    } else if(this.#isString(this.year)) {
      const dateParts = this.year.split('/');
      if(dateParts.length === 2){
        this.year=`00/${dateParts[0]}/${dateParts[1]}`;
      }else if (dateParts.length === 1){
        this.year = `00/00/${dateParts[0]}`;
      }
    }
  }

  #normalizeArray(arr) {
    return Array.isArray(arr)
      ? arr.map(v => v.trim()).filter(Boolean)
      : [];
  }

  #removeArrayDuplicates(arr) {
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr)];
  }

  normalize() {
    if (this.title !== undefined) this.title = this.title.trim();
    if (this.description !== undefined) this.description = this.description.trim();
    if (this.tagline !== undefined) this.tagline = this.tagline.trim();
    this.#normalizeYear();

    for (const field of this.#arrayFields) {
      if (this[field] !== undefined) {
        this[field] = this.#normalizeArray(this[field]);
        this[field] = this.#removeArrayDuplicates(this[field]);
      }
    }

    // Only apply defaults on create
    if (!this.#update) {
      this.vote_count = this.vote_count ?? 0;
      this.revenue = this.revenue ?? 0;
      this.runtime = this.runtime ?? 0;
      this.budget = this.budget ?? 0;
      this.popularity = this.popularity ?? 0;
      this.adult = this.adult ?? false;
    }
  }

  getUpdateObject() {
    const result = {};
  
    for (const key of Object.keys(this)) {
      const value = this[key];
  
      if (value === undefined || value === null) continue;
      if (typeof value === 'string' && value.trim() === '') continue;
      if (Array.isArray(value) && value.length === 0) continue;
  
      result[key] = value;
    }
  
    return result;
  }

  //factory method 
  static create(body, update = false) {
    const dto = new MovieDTO(body);
    dto.#update = update;
    dto.validate();
    dto.normalize(); // simple normalization 
    if(update === true) {
      return dto.getUpdateObject();
    }
    return dto;
  }
}