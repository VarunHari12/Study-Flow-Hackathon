const generateSTYLES = () => {
    return `
      <style>
        @import url(https://fonts.googleapis.com/css2?family=Baloo+2:wght@500&display=swap);
        body {
          background: #2e6d4e; /* Use the same green as in the popup */
          color: #fff;
          font-family: 'Baloo 2', cursive, Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
          margin: 0;
        }
        .c {
          text-align: center;
          display: block;
          position: relative;
          width: 60%; /* Increased width for the entire center section */
          margin: 0 auto;
        }
        ._404 {
          font-size: 150px; /* Increased font size */
          position: relative;
          display: inline-block;
          z-index: 2;
          height: 180px; /* Increased height */
          letter-spacing: 5px;
        }
        ._1 {
          text-align: center;
          display: block;
          position: relative;
          letter-spacing: 8px;
          font-size: 2.5em; /* Increased font size */
          line-height: 120%;
          margin-bottom: 20px;
        }
        ._2 {
          text-align: center;
          display: block;
          position: relative;
          font-size: 36px; /* Adjusted font size for the "_2" class */
          line-height: 150%;
        }
        hr {
          padding: 0;
          border: none;
          border-top: 3px solid #fff;
          color: #fff;
          text-align: center;
          margin: 20px auto;
          width: 60%;
          z-index: -10;
        }
        hr:after {
          display: inline-block;
          position: relative;
          top: -0.5em;
          font-size: 1.5em;
          padding: 0 0.2em;
          background: #2e6d4e; /* Use the same green as in the popup */
        }
      </style>`;
};

// generates the actual HTML page
const generateHTML = (intent) => {
    return `
      <div class='c'>
        <div class='_404'>404</div>
        <hr>
        <div class='_1'>GET BACK TO WORK</div>
        <div class='_2'>Do ${intent}</div>
      </div>`;
};
