export default function PageHero({ eyebrow, title, children }){
  return <section className="mp-hero"><p>{eyebrow}</p><h1>{title}</h1>{children && <div>{children}</div>}</section>
}
