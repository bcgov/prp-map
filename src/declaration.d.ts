export {};
declare module "*.module.css";
declare global {
  interface Window {
    _paq?: Array<string | any[]>;
  }
}

declare module "*.png" {
  const value: string;
  export default value;
}
