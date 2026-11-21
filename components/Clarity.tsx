import Script from "next/script";

// Microsoft Clarity (heatmaps and session recordings), the same project as
// slptransitions.com (James turned it on there on 2026-11-21). In the app it
// loads on the quiz and its result page only, where people decide whether to
// buy: /quiz and /quiz/embed. It is deliberately NOT on the Suite wizard, the
// report, the paid results or the course, which show résumés and personal
// answers on screen. The quiz's email field and résumé box carry
// data-clarity-mask so their contents are never recorded, whatever masking
// mode the Clarity project is set to. Production only, like Google Analytics.
export const CLARITY_ID = "zhayj3v8ki";

export default function Clarity() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}
