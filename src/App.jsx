import { useEffect, useMemo, useState } from "react";
import "./App.css";

const seed = [
  {
    id: "s1",
    title: "The Daylight Loft",
    category: "Photo Studio",
    rate: 85,
    location: "Brooklyn, New York",
    rating: "4.98",
    image: "photo- studio",
    photo: "photo-1497366754035-f200968a6e72",
    tag: "BESTSELLER",
    description:
      "A sun drenched, south facing creative loft with a full cyclorama wall, generous natural light and room to make something unforgettable.",
    amenities: [
      "Cyclorama wall",
      "Natural light",
      "Flash kit",
      "Changing room",
    ],
  },
  {
    id: "s2",
    title: "Analog House",
    category: "Music Suite",
    rate: 65,
    location: "East Austin, Texas",
    rating: "4.95",
    photo: "photo-1598488035139-bdbb2231ce04",
    tag: "CREATOR PICK",
    description:
      "A warm, acoustically treated recording room, set up for live tracking, intimate sessions and everything in between.",
    amenities: ["Live room", "Neumann U87", "Analog console", "Lounge"],
  },
  {
    id: "s3",
    title: "Room Tone Stage",
    category: "Film Stage",
    rate: 140,
    location: "Queens, New York",
    rating: "4.91",
    photo: "photo-1506157786151-b8491531f063",
    tag: "NEW",
    description:
      "A versatile black box stage with a lighting grid, quiet power and all the space your next production needs.",
    amenities: [
      "Lighting grid",
      "Green room",
      "3-phase power",
      "Load-in access",
    ],
  },
  {
    id: "s4",
    title: "Soft Focus Studio",
    category: "Photo Studio",
    rate: 72,
    location: "Silver Lake, Los Angeles",
    rating: "4.97",
    photo: "photo-1531058020387-3be344556be6",
    tag: "GUEST FAVORITE",
    description:
      "Thoughtfully styled sets and soft west coast light for portraits, editorials, product shoots and small crews.",
    amenities: ["Styling sets", "V-flats", "Props", "Parking"],
  },
  {
    id: "s5",
    title: "The Listening Room",
    category: "Podcast Lounge",
    rate: 95,
    location: "Lower East Side, New York",
    rating: "4.99",
    photo: "photo-1590602847861-f357a9332bbc",
    tag: "TOP RATED",
    description:
      "An inviting podcast room with a four mic setup, beautiful warm light and a quiet booth for clean recordings.",
    amenities: ["4 microphones", "Sound treated", "Video setup", "Coffee bar"],
  },
  {
    id: "s6",
    title: "Clay House Workshop",
    category: "Art Workshop",
    rate: 55,
    location: "Portland, Oregon",
    rating: "4.89",
    photo: "photo-1565193566173-7a0ee3dbe261",
    tag: "HIDDEN GEM",
    description:
      "A bright, fully equipped ceramics workshop made for classes, small collaborations and making a beautiful mess.",
    amenities: ["Pottery wheels", "Kiln access", "Work tables", "Aprons"],
  },
];
const categories = [
  ["Photo Studios", "◉", "Find your light"],
  ["Film Stages", "▤", "Big ideas, bigger sets"],
  ["Podcast Rooms", "◖", "Sound like yourself"],
  ["Music Suites", "♫", "Make a little noise"],
  ["Art Workshops", "✳", "Room to get messy"],
];
const image = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const stored = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.error || "Could not connect to StudioSpace. Please try again.",
    );
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [path, setPath] = useState(location.pathname + location.search);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [dark, setDark] = useState(() => stored("ss-dark", false));
  const [toast, setToast] = useState("");
  const [studios, setStudios] = useState(() => stored("ss-studios", seed));
  const [bookings, setBookings] = useState(() => stored("ss-bookings", []));
  const [favorites, setFavorites] = useState(() => stored("ss-favorites", []));
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(
    new URLSearchParams(location.search).get("category") || "All spaces",
  );
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const onPop = () => setPath(location.pathname + location.search);
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    let active = true;
    if (new URLSearchParams(location.search).has("oauthError")) {
      setToast("Google sign-in could not be completed. Please try again.");
      history.replaceState({}, "", location.pathname);
      setPath(location.pathname);
    }
    apiRequest("/api/auth/me")
      .then(({ user: sessionUser }) => {
        if (active) setUser(sessionUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    localStorage.setItem("ss-dark", JSON.stringify(dark));
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    localStorage.setItem("ss-studios", JSON.stringify(studios));
  }, [studios]);
  useEffect(() => {
    localStorage.setItem("ss-bookings", JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem("ss-favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const go = (to) => {
    history.pushState({}, "", to);
    setPath(to);
    setMenu(false);
    window.scrollTo(0, 0);
    const q = new URLSearchParams(to.split("?")[1] || "");
    setCategory(q.get("category") || "All spaces");
  };
  const requireAuth = (to) => {
    if (!user) {
      sessionStorage.setItem("ss-next", to);
      go("/login");
    } else go(to);
  };
  const filtered = useMemo(
    () =>
      studios.filter(
        (s) =>
          (category === "All spaces" ||
            s.category === category ||
            (category === "Film Stages" && s.category === "Film Stage") ||
            (category === "Podcast Rooms" && s.category === "Podcast Lounge") ||
            (category === "Art Workshops" && s.category === "Art Workshop")) &&
          (s.title + s.location + s.category)
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [studios, category, query],
  );
  const route = path.split("?")[0];
  const selected = studios.find((s) => route === `/studios/${s.id}`);
  const toggleFavorite = (id) => {
    if (!user) return requireAuth(`/studios/${id}`);
    setFavorites(
      favorites.includes(id)
        ? favorites.filter((f) => f !== id)
        : [...favorites, id],
    );
    setToast(
      favorites.includes(id)
        ? "Removed from your saved spaces"
        : "Saved to your wishlist",
    );
  };
  const book = (studio, form) => {
    const b = {
      id: Date.now(),
      studioId: studio.id,
      title: studio.title,
      owner: user.email,
      date: form.date,
      start: form.start,
      end: form.end,
      status: "Pending",
      rate: studio.rate,
    };
    setBookings([...bookings, b]);
    setModal(null);
    setToast("Booking request sent");
    go("/my-bookings");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("/");
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            studio<span className="brand-light">space</span>
            <small>MAKE ROOM FOR IDEAS</small>
          </span>
        </a>
        <nav className="main-nav">
          <a
            className={route === "/" ? "active" : ""}
            href="/"
            onClick={(e) => {
              e.preventDefault();
              go("/");
            }}
          >
            Home
          </a>
          <a
            className={route === "/studios" ? "active" : ""}
            href="/studios"
            onClick={(e) => {
              e.preventDefault();
              go("/studios");
            }}
          >
            Explore studios
          </a>
          <a
            href="/#how"
            onClick={(e) => {
              e.preventDefault();
              go("/#how");
            }}
          >
            How it works
          </a>
          <a
            href="/#about"
            onClick={(e) => {
              e.preventDefault();
              go("/#about");
            }}
          >
            About us
          </a>
        </nav>
        <div className="nav-actions">
          <button
            className="theme-button"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? "☼" : "◐"}
          </button>
          {user ? (
            <div className="profile-wrap">
              <button className="avatar-button" onClick={() => setMenu(!menu)}>
                <img
                  src={
                    user.photo ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  }
                  alt=""
                />
                <span className="avatar-caret">⌄</span>
              </button>
              {menu && (
                <div className="profile-menu">
                  <div className="profile-intro">
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </div>
                  {[
                    ["Dashboard", "/dashboard"],
                    ["Add new studio", "/add-studio"],
                    ["My studio listings", "/my-listings"],
                    ["My bookings", "/my-bookings"],
                  ].map(([t, p]) => (
                    <button key={p} onClick={() => go(p)}>
                      {t}
                    </button>
                  ))}
                  <button
                    className="logout"
                    onClick={async () => {
                      await apiRequest("/api/auth/logout", {
                        method: "POST",
                      }).catch(() => {});
                      setUser(null);
                      go("/");
                      setToast("You’re signed out");
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="text-button" onClick={() => go("/login")}>
                Log in
              </button>
              <button
                className="button button-dark button-small"
                onClick={() => go("/register")}
              >
                Sign up <span>↗</span>
              </button>
            </>
          )}
        </div>
      </header>
      {route === "/" && (
        <Home
          go={go}
          studios={studios}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
        />
      )}
      {route === "/studios" && (
        <main className="page-main">
          <div className="page-heading">
            <div>
              <span className="eyebrow">THE CREATIVE DIRECTORY</span>
              <h1>
                Find your next
                <br />
                favorite <em>space.</em>
              </h1>
              <p>Remarkable spaces, rented by the hour. Make something good.</p>
            </div>
            <div className="heading-note">
              {studios.length} spaces and counting <span>↗</span>
            </div>
          </div>
          <div className="search-row">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try ‘daylight studio in Brooklyn’"
              />
              <kbd>⌘ K</kbd>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                go(
                  `/studios${e.target.value === "All spaces" ? "" : `?category=${encodeURIComponent(e.target.value)}`}`,
                );
              }}
            >
              <option>All spaces</option>
              {categories.map((c) => (
                <option key={c[0]}>{c[0]}</option>
              ))}
              <option>Photo Studio</option>
              <option>Film Stage</option>
              <option>Podcast Lounge</option>
              <option>Music Suite</option>
              <option>Art Workshop</option>
            </select>
            <button
              className="filter-button"
              onClick={() => setToast("More filters coming soon")}
            >
              ☷ <span>Filters</span>
            </button>
          </div>
          <div className="studio-grid">
            {filtered.map((s) => (
              <StudioCard
                key={s.id}
                studio={s}
                go={go}
                toggleFavorite={toggleFavorite}
                saved={favorites.includes(s.id)}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <span>⌕</span>
              <h2>No spaces found just yet.</h2>
              <p>
                Try a different search or clear your filters to see all the good
                stuff.
              </p>
              <button
                className="button button-dark"
                onClick={() => {
                  setQuery("");
                  setCategory("All spaces");
                }}
              >
                Show all spaces ↗
              </button>
            </div>
          )}
        </main>
      )}
      {selected && (
        <main className="page-main detail-page">
          <button className="back-link" onClick={() => go("/studios")}>
            ← All studios
          </button>
          <div className="detail-hero">
            <img src={image(selected.photo, 1600)} alt={selected.title} />
            <div className="detail-photo-note">A SPACE TO MAKE SOMETHING</div>
          </div>
          <div className="detail-layout">
            <section>
              <span className="eyebrow">
                {selected.category.toUpperCase()} ·{" "}
                {selected.location.toUpperCase()}
              </span>
              <h1>{selected.title}</h1>
              <div className="detail-rating">
                ★ {selected.rating} <span>·</span> Hosted by Maya Chen ·{" "}
                <span>Superhost</span>
              </div>
              <p className="detail-description">{selected.description}</p>
              <hr />
              <h2>What this space offers</h2>
              <div className="amenities">
                {selected.amenities.map((a) => (
                  <span key={a}>✳ &nbsp;{a}</span>
                ))}
              </div>
              <div className="host-card">
                <span className="host-avatar">M</span>
                <div>
                  <b>Your host, Maya</b>
                  <small>
                    Joined StudioSpace in 2023 · Responds within an hour
                  </small>
                </div>
                <button
                  onClick={() => setToast("Host messaging is coming soon")}
                >
                  Message host ↗
                </button>
              </div>
            </section>
            <aside className="booking-card">
              <div className="booking-price">
                <b>${selected.rate}</b> <span>/ hour</span>
                <span className="mini-rating">★ {selected.rating}</span>
              </div>
              <p>Reserve a time to make something.</p>
              <button
                className="button button-orange book-cta"
                onClick={() =>
                  user
                    ? setModal(selected)
                    : requireAuth(`/studios/${selected.id}`)
                }
              >
                Book workspace <span>↗</span>
              </button>
              <small>You won’t be charged yet</small>
              <div className="booking-assurance">
                ◉ &nbsp;Free cancellation within 24 hours
              </div>
            </aside>
          </div>
        </main>
      )}
      {route === "/login" && (
        <AuthPage mode="login" go={go} setUser={setUser} setToast={setToast} />
      )}
      {route === "/register" && (
        <AuthPage
          mode="register"
          go={go}
          setUser={setUser}
          setToast={setToast}
        />
      )}
      {["/dashboard", "/my-bookings", "/my-listings", "/add-studio"].includes(
        route,
      ) &&
        authReady && (
          <PrivatePage
            route={route}
            user={user}
            requireAuth={requireAuth}
            go={go}
            studios={studios}
            setStudios={setStudios}
            bookings={bookings}
            setBookings={setBookings}
            setToast={setToast}
            modal={modal}
            setModal={setModal}
          />
        )}
      {route === "/#how" && (
        <InfoPage
          go={go}
          id="how"
          title="Good work starts with the right space."
        />
      )}
      {route === "/#about" && (
        <InfoPage go={go} id="about" title="A little more room to make." />
      )}
      {![
        "/",
        "/studios",
        "/login",
        "/register",
        "/dashboard",
        "/my-bookings",
        "/my-listings",
        "/add-studio",
        "/#how",
        "/#about",
      ].includes(route) &&
        !selected && (
          <main className="not-found">
            <div className="not-found-art">
              404<span>◉</span>
            </div>
            <span className="eyebrow">WELL, THIS IS AWKWARD</span>
            <h1>
              Looks like this set
              <br />
              is <em>between takes.</em>
            </h1>
            <p>
              The space you’re looking for may have moved. Let’s get you back to
              the good stuff.
            </p>
            <button className="button button-dark" onClick={() => go("/")}>
              Return to home ↗
            </button>
          </main>
        )}
      <Footer go={go} />
      {toast && (
        <div className="toast">
          <span>✓</span>
          {toast}
        </div>
      )}
      {modal &&
        (modal.type === "delete" ? (
          <ConfirmDelete
            studio={modal.studio}
            close={() => setModal(null)}
            confirm={() => {
              setStudios(studios.filter((s) => s.id !== modal.studio.id));
              setModal(null);
              setToast("Studio listing deleted");
            }}
          />
        ) : (
          <BookingModal
            studio={modal}
            close={() => setModal(null)}
            book={book}
          />
        ))}
    </div>
  );
}

function Home({ go, studios, toggleFavorite, favorites }) {
  const [slide, setSlide] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const slides = [
    {
      kicker: "A BETTER BACKDROP FOR BIG IDEAS",
      title: (
        <>
          Make space
          <br />
          for <em>what’s next.</em>
        </>
      ),
      copy: "Book inspiring creative spaces by the hour. For the shoots, sounds and stories you can’t wait to make.",
      photo: "photo-1497366754035-f200968a6e72",
    },
    {
      kicker: "YOUR NEXT TAKE STARTS HERE",
      title: (
        <>
          Find the room
          <br />
          to <em>make a scene.</em>
        </>
      ),
      copy: "From sound stages to sunlit studios, your next creative home is closer than you think.",
      photo: "photo-1506157786151-b8491531f063",
    },
    {
      kicker: "GOOD THINGS HAPPEN IN GOOD COMPANY",
      title: (
        <>
          Show up.
          <br />
          Make <em>something.</em>
        </>
      ),
      copy: "Meet the hosts and spaces that make the creative process feel a little more possible.",
      photo: "photo-1598488035139-bdbb2231ce04",
    },
  ];
  useEffect(() => {
    const t = setInterval(() => setSlide((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <main>
      <section
        className="hero-home"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(16,17,17,.76) 0%,rgba(16,17,17,.34) 52%,rgba(16,17,17,.05) 100%),url(${image(slides[slide].photo, 1900)})`,
        }}
      >
        <div className="hero-copy">
          <span className="hero-kicker">
            <i />
            {slides[slide].kicker}
          </span>
          <h1>{slides[slide].title}</h1>
          <p>{slides[slide].copy}</p>
          <div className="hero-actions">
            <button
              className="button button-orange"
              onClick={() => go("/studios")}
            >
              Explore studios <span>↗</span>
            </button>
            <button
              className="button button-glass"
              onClick={() => go("/add-studio")}
            >
              Host your space
            </button>
          </div>
        </div>
        <div className="hero-foot">
          <span>
            0{slide + 1} / 03 &nbsp;{" "}
            <button onClick={() => setSlide((slide + 2) % 3)}>←</button>{" "}
            <button onClick={() => setSlide((slide + 1) % 3)}>→</button>
          </span>
          <span className="hero-location">
            Brooklyn, NY &nbsp; · &nbsp; 40°41′ N 73°59′ W
          </span>
        </div>
        <div className="hero-index">
          0{slide + 1}
          <span> / 03</span>
        </div>
      </section>
      <section className="featured section-wrap">
        <SectionHead
          label="GOOD SPACES. GOOD PEOPLE."
          title={
            <>
              Made for your
              <br />
              <em>next big thing.</em>
            </>
          }
          action="Explore all studios"
          onClick={() => go("/studios")}
        />
        <div className="studio-grid">
          {studios.slice(0, 3).map((s) => (
            <StudioCard
              key={s.id}
              studio={s}
              go={go}
              toggleFavorite={toggleFavorite}
              saved={favorites.includes(s.id)}
            />
          ))}
        </div>
      </section>
      <section className="category-section">
        <div className="section-wrap">
          <SectionHead
            label="FIND YOUR KIND OF SPACE"
            title={
              <>
                What are you
                <br />
                <em>here to make?</em>
              </>
            }
          />
          <div className="category-grid">
            {categories.map(([name, icon, sub], i) => (
              <button
                className="category-tile"
                key={name}
                onClick={() =>
                  go(`/studios?category=${encodeURIComponent(name)}`)
                }
              >
                <span className={`category-icon icon-${i}`}>{icon}</span>
                <b>{name}</b>
                <small>{sub}</small>
                <span className="category-arrow">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section id="how" className="steps-section section-wrap">
        <div>
          <span className="eyebrow">LESS SCROLLING, MORE MAKING</span>
          <h2>
            Four steps from
            <br />
            idea to <em>action.</em>
          </h2>
          <p className="section-intro">
            We made finding and booking your next creative space refreshingly
            simple.
          </p>
          <button className="text-link" onClick={() => go("/studios")}>
            Find your space <span>↗</span>
          </button>
        </div>
        <div className="steps-list">
          {[
            [
              "01",
              "Discover spaces",
              "Find the right backdrop from a community of creative hosts.",
            ],
            [
              "02",
              "Pick your hours",
              "Choose a date and time that works for your project.",
            ],
            [
              "03",
              "Book with confidence",
              "Send a request with clear pricing and no surprises.",
            ],
            [
              "04",
              "Make something good",
              "Show up, settle in, and bring your idea to life.",
            ],
          ].map(([n, t, d]) => (
            <div className="step-row" key={n}>
              <span>{n}</span>
              <div>
                <b>{t}</b>
                <p>{d}</p>
              </div>
              <span className="step-arrow">↗</span>
            </div>
          ))}
        </div>
      </section>
      <section id="about" className="promise">
        <div
          className="promise-image"
          style={{
            backgroundImage: `url(${image("photo-1497366811353-6870744d04b2", 1100)})`,
          }}
        >
          <span>
            BUILT FOR THE
            <br />
            MAKERS AMONG US.
          </span>
        </div>
        <div className="promise-copy">
          <span className="eyebrow">A CREATIVE SPACE, A SAFE SPACE</span>
          <h2>
            Go make the
            <br />
            <em>thing you came for.</em>
          </h2>
          <p>
            Good work needs the right room, and the confidence to get to work.
            We take care of the details so you can take care of the idea.
          </p>
          <div className="promise-points">
            <span>
              <b>◉</b> Verified spaces & hosts
            </span>
            <span>
              <b>✳</b> Clear, honest pricing
            </span>
            <span>
              <b>♡</b> Human support, always
            </span>
            <span>
              <b>↗</b> Every kind of creator
            </span>
          </div>
          <button className="button button-dark" onClick={() => go("/studios")}>
            Find your space ↗
          </button>
        </div>
      </section>
      <section className="newsletter section-wrap">
        <div>
          <span className="eyebrow">GOOD THINGS, OCCASIONALLY</span>
          <h2>
            A little creative
            <br />
            <em>inspiration, delivered.</em>
          </h2>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            setSubscribed(true);
          }}
        >
          <input type="email" required placeholder="Your email address" />
          <button aria-label="Subscribe">↗</button>
          <small>
            {subscribed
              ? "Thanks for joining our creative community."
              : "No noise. Just new spaces and stories worth sharing."}
          </small>
        </form>
      </section>
    </main>
  );
}

function SectionHead({ label, title, action, onClick }) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{label}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-link" onClick={onClick}>
          {action} <span>↗</span>
        </button>
      )}
    </div>
  );
}
function StudioCard({ studio: s, go, toggleFavorite, saved }) {
  return (
    <article className="studio-card">
      <button
        className="studio-image"
        onClick={() => go(`/studios/${s.id}`)}
        style={{ backgroundImage: `url(${image(s.photo, 900)})` }}
        aria-label={`View ${s.title}`}
      >
        <span className="studio-tag">{s.tag}</span>
      </button>
      <button
        className={`favorite ${saved ? "saved" : ""}`}
        aria-label="Save studio"
        onClick={() => toggleFavorite(s.id)}
      >
        {saved ? "♥" : "♡"}
      </button>
      <div className="studio-info">
        <div className="studio-meta">
          <span>{s.category}</span>
          <span className="rating">★ {s.rating}</span>
        </div>
        <h3 onClick={() => go(`/studios/${s.id}`)}>{s.title}</h3>
        <p>{s.location}</p>
        <div className="studio-bottom">
          <span>
            <b>${s.rate}</b> / hr
          </span>
          <button onClick={() => go(`/studios/${s.id}`)}>
            View space <span>↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}
function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a
            className="brand brand-invert"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              go("/");
            }}
          >
            <span className="brand-mark">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              studio<span className="brand-light">space</span>
              <small>MAKE ROOM FOR IDEAS</small>
            </span>
          </a>
          <p>
            A little more room for the
            <br />
            things you were born to make.
          </p>
        </div>
        <div>
          <b>EXPLORE</b>
          <button onClick={() => go("/studios")}>All studios</button>
          <button onClick={() => go("/studios?category=Photo%20Studios")}>
            Photo studios
          </button>
          <button onClick={() => go("/studios?category=Music%20Suites")}>
            Music suites
          </button>
          <button onClick={() => go("/studios?category=Art%20Workshops")}>
            Art workshops
          </button>
        </div>
        <div>
          <b>STUDIOSPACE</b>
          <button onClick={() => go("/#how")}>How it works</button>
          <button onClick={() => go("/#about")}>About us</button>
          <button onClick={() => go("/add-studio")}>List your space</button>
          <button onClick={() => go("/my-bookings")}>Your bookings</button>
        </div>
        <div className="footer-social">
          <b>FOLLOW THE GOOD STUFF</b>
          <span>Instagram &nbsp; ↗</span>
          <span>TikTok &nbsp; ↗</span>
          <span>X &nbsp; ↗</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 StudioSpace, Inc. Made for the makers.</span>
        <span>
          Privacy &nbsp; · &nbsp; Terms &nbsp; · &nbsp; Made with care <i>✳</i>
        </span>
      </div>
    </footer>
  );
}

function AuthPage({ mode, go, setUser, setToast }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const d = Object.fromEntries(new FormData(e.currentTarget));
    if (
      register &&
      (!/[A-Z]/.test(d.password) ||
        !/[a-z]/.test(d.password) ||
        d.password.length < 6)
    ) {
      setErr(
        "Use at least 6 characters, including one uppercase and one lowercase letter.",
      );
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: d.name,
            email: d.email,
            photo: d.photo || "",
            password: d.password,
          }),
        });
        setToast("Your account is ready. Log in to continue.");
        go("/login");
      } else {
        const result = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: d.email, password: d.password }),
        });
        setUser(result.user);
        setToast("Welcome back");
        const next = sessionStorage.getItem("ss-next") || "/";
        sessionStorage.removeItem("ss-next");
        go(next);
      }
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };
  const googleLogin = () => {
    const returnTo = sessionStorage.getItem("ss-next") || "/";
    window.location.assign(
      `${API_BASE}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`,
    );
  };
  return (
    <main className="auth-page">
      <div
        className="auth-visual"
        style={{
          backgroundImage: `linear-gradient(0deg,rgba(20,20,18,.72),rgba(20,20,18,.04)),url(${image("photo-1531058020387-3be344556be6", 1300)})`,
        }}
      >
        <div>
          <span className="eyebrow">A SPACE TO MAKE IT HAPPEN</span>
          <h2>
            Great things
            <br />
            need room
            <br />
            to <em>happen.</em>
          </h2>
          <p>Find your next favorite space on StudioSpace.</p>
        </div>
        <span className="auth-photo-credit">
          A better backdrop for your big ideas.
        </span>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">
            {register ? "YOUR CREATIVE COMMUNITY" : "WELCOME BACK, CREATOR"}
          </span>
          <h1>
            {register ? "Make yourself at home." : "Good to have you back."}
          </h1>
          <p>
            {register
              ? "Create an account and find room to make."
              : "Sign in and pick up where your ideas left off."}
          </p>
          {err && (
            <div className="form-error" role="alert">
              {err}
            </div>
          )}
          <form onSubmit={submit}>
            {register && (
              <>
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    placeholder="How should we call you?"
                  />
                </label>
                <label>
                  Photo URL <span className="optional">OPTIONAL</span>
                  <input name="photo" type="url" placeholder="https://..." />
                </label>
              </>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                placeholder="At least 6 characters"
              />
            </label>
            {!register && (
              <button
                type="button"
                className="forgot"
                onClick={() => setToast("Password reset is not enabled")}
              >
                Forgot password?
              </button>
            )}
            <button className="button button-dark auth-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : register
                  ? "Create your account"
                  : "Log in"}{" "}
              <span>↗</span>
            </button>
          </form>
          <div className="auth-divider">
            <span />
            or continue with
            <span />
          </div>
          <button className="google-button" onClick={googleLogin}>
            <b>G</b> Continue with Google
          </button>
          <div className="auth-switch">
            {register ? "Already have an account?" : "New around here?"}{" "}
            <button onClick={() => go(register ? "/login" : "/register")}>
              {register ? "Log in" : "Create an account"}
            </button>
          </div>
          <small className="auth-terms">
            By continuing, you agree to our <u>Terms of Service</u> and{" "}
            <u>Privacy Policy</u>.
          </small>
        </div>
      </div>
    </main>
  );
}

function PrivatePage({
  route,
  user,
  requireAuth,
  go,
  studios,
  setStudios,
  bookings,
  setBookings,
  setToast,
  setModal,
}) {
  useEffect(() => {
    if (!user) requireAuth(route);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!user) return null;
  const mine = studios.filter((s) => s.owner === user.email);
  if (route === "/add-studio")
    return (
      <main className="page-main form-page">
        <span className="eyebrow">GIVE YOUR SPACE A SPOTLIGHT</span>
        <h1>
          List a space.
          <br />
          <em>Meet your people.</em>
        </h1>
        <p className="form-lead">
          Tell creators what makes your space a good place to make something.
        </p>
        <StudioForm
          user={user}
          onSave={(s) => {
            setStudios([
              ...studios,
              {
                ...s,
                id: `s${Date.now()}`,
                rating: "New",
                tag: "JUST ADDED",
                owner: user.email,
              },
            ]);
            setToast("Your studio is live");
            go("/my-listings");
          }}
        />
      </main>
    );
  if (route === "/my-listings")
    return (
      <main className="page-main">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">YOUR CREATIVE CORNER</span>
            <h1>
              My studio <em>listings.</em>
            </h1>
            <p>Your spaces, all in one place.</p>
          </div>
          <button
            className="button button-dark"
            onClick={() => go("/add-studio")}
          >
            ＋ Add a studio
          </button>
        </div>
        {mine.length ? (
          mine.map((s) => (
            <div className="listing-row" key={s.id}>
              <img src={image(s.photo, 400)} alt="" />
              <div>
                <b>{s.title}</b>
                <span>
                  {s.category} · {s.location}
                </span>
              </div>
              <strong>${s.rate} / hr</strong>
              <button onClick={() => setModal({ type: "delete", studio: s })}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span>✳</span>
            <h2>Your space deserves a spot on the map.</h2>
            <p>List a creative space and meet the people who will love it.</p>
            <button
              className="button button-dark"
              onClick={() => go("/add-studio")}
            >
              List your first studio ↗
            </button>
          </div>
        )}
      </main>
    );
  if (route === "/my-bookings")
    return (
      <main className="page-main">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">YOUR NEXT CREATIVE SESSION</span>
            <h1>
              My <em>bookings.</em>
            </h1>
            <p>Every good idea starts somewhere.</p>
          </div>
          <button className="button button-dark" onClick={() => go("/studios")}>
            Find a studio ↗
          </button>
        </div>
        {bookings.filter((b) => b.owner === user.email).length ? (
          bookings
            .filter((b) => b.owner === user.email)
            .map((b) => (
              <div className="booking-row" key={b.id}>
                <div className="booking-calendar">
                  {b.date
                    ? new Date(`${b.date}T12:00:00`).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "2-digit" },
                      )
                    : "ANY"}
                </div>
                <div className="booking-row-main">
                  <b>{b.title}</b>
                  <span>
                    {b.date || "Date to be confirmed"} ·{" "}
                    {b.start || "Flexible time"}
                    {b.end ? ` – ${b.end}` : ""}
                  </span>
                </div>
                <span className={`status status-${b.status.toLowerCase()}`}>
                  {b.status}
                </span>
                {b.status === "Pending" && (
                  <button
                    onClick={() => {
                      setBookings(
                        bookings.map((x) =>
                          x.id === b.id ? { ...x, status: "Cancelled" } : x,
                        ),
                      );
                      setToast("Booking cancelled");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))
        ) : (
          <div className="empty-state">
            <span>↗</span>
            <h2>Nothing on the calendar. Yet.</h2>
            <p>
              Your next creative session is just around the corner. Find a space
              you love.
            </p>
            <button
              className="button button-dark"
              onClick={() => go("/studios")}
            >
              Explore studios ↗
            </button>
          </div>
        )}
      </main>
    );
  return (
    <main className="page-main">
      <span className="eyebrow">A GOOD DAY TO MAKE SOMETHING</span>
      <h1>
        Welcome, <em>{user.name}.</em>
      </h1>
      <p className="form-lead">Where should we start?</p>
      <div className="dashboard-tiles">
        {[
          ["Explore spaces", "Meet your next favorite studio.", "/studios"],
          ["List a studio", "Share your creative home.", "/add-studio"],
          ["My bookings", "Pick up where your ideas left off.", "/my-bookings"],
          ["My listings", "Keep your spaces up to date.", "/my-listings"],
        ].map(([t, d, p]) => (
          <button key={p} onClick={() => go(p)}>
            <span>↗</span>
            <b>{t}</b>
            <small>{d}</small>
          </button>
        ))}
      </div>
    </main>
  );
}
function ConfirmDelete({ studio, close, confirm }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="booking-modal">
        <button className="modal-close" onClick={close}>
          ×
        </button>
        <span className="eyebrow">REMOVE YOUR LISTING</span>
        <h2>
          Delete this <em>space?</em>
        </h2>
        <p>This will remove “{studio.title}” from your studio listings.</p>
        <div className="form-two">
          <button className="button button-glass" onClick={close}>
            Keep listing
          </button>
          <button className="button button-dark" onClick={confirm}>
            Delete listing
          </button>
        </div>
      </div>
    </div>
  );
}
function StudioForm({ user, onSave }) {
  const [error, setError] = useState("");
  return (
    <form
      className="studio-form"
      onSubmit={(e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.currentTarget));
        if (!d.title || !d.rate || !d.image) {
          setError("Please fill in the required fields.");
          return;
        }
        onSave({
          ...d,
          rate: Number(d.rate),
          amenities: d.amenities
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          photo: d.image,
          location: d.location || "Location to be confirmed",
          description:
            d.description || "A creative space ready for your next project.",
        });
      }}
    >
      {error && <div className="form-error">{error}</div>}
      <label>
        Studio name
        <input name="title" required placeholder="e.g. The Daylight Loft" />
      </label>
      <div className="form-two">
        <label>
          Category
          <select name="category">
            <option>Photo Studio</option>
            <option>Film Stage</option>
            <option>Podcast Lounge</option>
            <option>Music Suite</option>
            <option>Art Workshop</option>
          </select>
        </label>
        <label>
          Hourly rate <span className="optional">USD</span>
          <input name="rate" type="number" min="1" required placeholder="85" />
        </label>
      </div>
      <div className="form-two">
        <label>
          Security deposit
          <input name="deposit" type="number" placeholder="0" />
        </label>
        <label>
          Max capacity
          <input name="capacity" type="number" placeholder="8" />
        </label>
      </div>
      <label>
        Location / address
        <input name="location" placeholder="Neighborhood, city" />
      </label>
      <label>
        Image URL
        <input name="image" type="url" required placeholder="https://..." />
      </label>
      <label>
        Amenities <span className="optional">COMMA SEPARATED</span>
        <input
          name="amenities"
          placeholder="Natural light, cyclorama, changing room"
        />
      </label>
      <label>
        Tell us about your space
        <textarea
          name="description"
          rows="4"
          placeholder="What makes this a special place to create?"
        />
      </label>
      <label>
        Host name
        <input value={user.name} readOnly />
      </label>
      <label>
        Host email
        <input value={user.email} readOnly />
      </label>
      <button className="button button-dark auth-submit">
        Publish your studio <span>↗</span>
      </button>
    </form>
  );
}
function BookingModal({ studio, close, book }) {
  const [date, setDate] = useState(""),
    [start, setStart] = useState("10:00"),
    [end, setEnd] = useState("12:00");
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        className="booking-modal"
        onSubmit={(e) => {
          e.preventDefault();
          if (date && end > start) book(studio, { date, start, end });
        }}
      >
        <button type="button" className="modal-close" onClick={close}>
          ×
        </button>
        <span className="eyebrow">MAKE IT OFFICIAL</span>
        <h2>
          Book this <em>space.</em>
        </h2>
        <p>
          {studio.title} · ${studio.rate} / hour
        </p>
        <label>
          Choose a date
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div className="form-two">
          <label>
            Start time
            <input
              type="time"
              value={start}
              required
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            End time
            <input
              type="time"
              value={end}
              required
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <div className="booking-total">
          <span>Estimated total</span>
          <b>
            $
            {studio.rate *
              Math.max(
                1,
                Number(end.split(":")[0]) - Number(start.split(":")[0]),
              )}
          </b>
        </div>
        <button className="button button-orange auth-submit">
          Send booking request ↗
        </button>
        <small className="modal-note">
          Your request will be pending until the host confirms.
        </small>
      </form>
    </div>
  );
}
function InfoPage({ go, id, title }) {
  return (
    <main className="page-main info-page" id={id}>
      <span className="eyebrow">STUDIOSPACE, IN FOUR MOVES</span>
      <h1>{title}</h1>
      <p>
        Find a space, choose your time, book with confidence, then get on with
        making something good.
      </p>
      <div className="info-steps">
        {[
          "Discover the right space",
          "Pick your hours",
          "Book with confidence",
          "Make something good",
        ].map((t, i) => (
          <div key={t}>
            <span>0{i + 1}</span>
            <h2>{t}</h2>
            <p>Every detail is here to make your creative day easy.</p>
          </div>
        ))}
      </div>
      <button className="button button-dark" onClick={() => go("/studios")}>
        Find your space ↗
      </button>
    </main>
  );
}
export default App;
