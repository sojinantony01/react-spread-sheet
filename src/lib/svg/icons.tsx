type AvailableIcons =
  | "align-left"
  | "align-right"
  | "align-center"
  | "align-justify"
  | "right-arrow"
  | "merge";
const Icons = ({ type }: { type: AvailableIcons }) => {
  switch (type) {
    case "align-left":
      return (
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M3 10H16M3 14H21M3 18H16M3 6H21"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
        </svg>
      );
    case "align-right":
      return (
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M8 10H21M3 14H21M8 18H21M3 6H21"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
        </svg>
      );
    case "align-center":
      return (
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M3 6H21M3 14H21M17 10H7M17 18H7"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
        </svg>
      );
    case "align-justify":
      return (
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 10H21M3 14H21M3 18H21M3 6H21"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "right-arrow":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
          <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" />
        </svg>
      );
    case "merge":
      return (
        <svg
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.5 21H17.75C19.5449 21 21 19.5449 21 17.75V17H12.5V21Z" fill="#212121" />
          <path d="M21 7V6.25C21 4.45507 19.5449 3 17.75 3H12.5V7H21Z" fill="#212121" />
          <path d="M11 3H6.25C4.45507 3 3 4.45507 3 6.25V7H11V3Z" fill="#212121" />
          <path d="M3 8.5V15.5H21V8.5H3Z" fill="#212121" />
          <path d="M3 17V17.75C3 19.5449 4.45507 21 6.25 21H11V17H3Z" fill="#212121" />
        </svg>
      );
  }
};
export default Icons;
