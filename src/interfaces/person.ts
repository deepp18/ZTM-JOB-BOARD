export default interface Person {
  id: string;
  name: string;
  img?: string;
  email?: string;
  jobTitle?: string;   // some entries use this
  jobtitle?: string;   // some entries use lowercase
  industry?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  links?: {
    website?: string;
    linkedin?: string;
    github?: string;
  };
  // other fields optional...
}
