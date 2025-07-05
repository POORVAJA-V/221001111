import react from "react"
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Log  from "../Logging Middleware/Loginmiddleware";
import {
Container,
TextField,
Button,
Typography,
Paper,
Box,
List,
ListItem,
ListItemText,
Snackbar,
Alert,
} from "@mui/material";


// validating the url
const isValidUrl = (url) => {
try {
    new URL(url);
    return true;
} catch {
    return false;
}
};

//generation of short urls
const generateShortCode = () => Math.random().toString(36).substring(2, 8);

const DEFAULT_VALIDITY_DAYS = 7;

const UrlShortener = () => {
const { isAuthenticated, user } =  Log();
const [originalUrl, setOriginalUrl] = useState("");
const [customCode, setCustomCode] = useState("");
const [validity, setValidity] = useState(DEFAULT_VALIDITY_DAYS);
const [shortLinks, setShortLinks] = useState([]);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [analytics, setAnalytics] = useState({});
const [showResult, setShowResult] = useState(false);


React.useEffect(() => {
    const stored = localStorage.getItem("shortLinks");
    if (stored) setShortLinks(JSON.parse(stored));
}, []);

React.useEffect(() => {
    localStorage.setItem("shortLinks", JSON.stringify(shortLinks));
}, [shortLinks]);

const handleShorten = () => {
    setError("");
    setSuccess("");
    setShowResult(false);

    if (!isAuthenticated) {
        setError("You must be logged in to shorten URLs.");
        return;
    }

    if (!isValidUrl(originalUrl)) {
        setError("Please enter a valid URL.");
        return;
    }

    if (validity < 1 || validity > 365) {
        setError("Validity must be between 1 and 365 days.");
        return;
    }

    let code = customCode.trim() || generateShortCode();

    // To Ensure Uniqueness
    if (shortLinks.some((link) => link.code === code)) {
        setError("Shortcode already exists. Please choose another.");
        return;
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(validity));

    const newLink = {
        id: uuidv4(),
        originalUrl,
        code,
        createdAt: new Date().toISOString(),
        expiry: expiry.toISOString(),
        clicks: 0,
        user: user?.username || "anonymous",
    };

    setShortLinks([newLink, ...shortLinks]);
    setAnalytics((prev) => ({ ...prev, [code]: 0 }));
    setSuccess("URL shortened successfully!");
    setShowResult(true);
    setOriginalUrl("");
    setCustomCode("");
    setValidity(DEFAULT_VALIDITY_DAYS);
};

const handleRedirect = (code) => {
    const link = shortLinks.find((l) => l.code === code);
    if (!link) {
        setError("Shortlink not found.");
        return;
    }
    if (new Date(link.expiry) < new Date()) {
        setError("This shortlink has expired.");
        return;
    }
    setAnalytics((prev) => ({
        ...prev,
        [code]: (prev[code] || 0) + 1,
    }));
    setShortLinks((prev) =>
        prev.map((l) =>
            l.code === code ? { ...l, clicks: l.clicks + 1 } : l
        )
    );
    window.open(link.originalUrl, "_blank");
};

return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Paper
            elevation={6}
            sx={{
                p: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            }}
        >
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#1976d2",
                    mb: 3,
                }}
            >
                🔗 URL Shortener
            </Typography>
            <Box
                component="form"
                noValidate
                autoComplete="off"
                sx={{
                    mb: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <TextField
                    label="Enter URL"
                    fullWidth
                    margin="normal"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    variant="outlined"
                    sx={{ background: "#fff", borderRadius: 2 }}
                />
                <TextField
                    label="Custom Shortcode (optional)"
                    fullWidth
                    margin="normal"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.replace(/\s/g, ""))}
                    inputProps={{ maxLength: 12 }}
                    variant="outlined"
                    sx={{ background: "#fff", borderRadius: 2 }}
                />
                <TextField
                    label="Validity (days)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={validity}
                    onChange={(e) => setValidity(e.target.value)}
                    inputProps={{ min: 1, max: 365 }}
                    required
                    variant="outlined"
                    sx={{ background: "#fff", borderRadius: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                        mt: 1,
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2,
                        background: "linear-gradient(90deg, #1976d2 60%, #ec407a 100%)",
                        boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.15)",
                    }}
                    onClick={handleShorten}
                >
                    🚀 Shorten URL
                </Button>
            </Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}
            {success && showResult && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    {success}
                </Alert>
            )}
            {showResult && shortLinks.length > 0 && (
                <Paper
                    sx={{
                        p: 2,
                        mb: 2,
                        background: "linear-gradient(90deg, #fffde7 60%, #e1bee7 100%)",
                        borderRadius: 2,
                        border: "1px solid #f3e5f5",
                        textAlign: "center",
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        🎉 Your Shortened URL:
                    </Typography>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `${window.location.origin}/s/${shortLinks[0].code}`
                            )
                        }
                        sx={{
                            mt: 1,
                            mb: 1,
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3,
                        }}
                    >
                        {`${window.location.origin}/s/${shortLinks[0].code}`}
                    </Button>
                    <Typography variant="body2" sx={{ color: "#7b1fa2" }}>
                        Valid till: {new Date(shortLinks[0].expiry).toLocaleString()}
                    </Typography>
                </Paper>
            )}
            <Typography
                variant="h6"
                sx={{
                    mt: 4,
                    mb: 1,
                    fontWeight: 700,
                    color: "#1976d2",
                    letterSpacing: 0.5,
                }}
            >
                📊 Your Shortened URLs & Analytics
            </Typography>
            <List sx={{ bgcolor: "#fafafa", borderRadius: 2, boxShadow: "0 1px 4px #e1bee7" }}>
                {shortLinks.length === 0 && (
                    <ListItem>
                        <ListItemText
                            primary="No shortlinks created yet."
                            primaryTypographyProps={{ align: "center", color: "text.secondary" }}
                        />
                    </ListItem>
                )}
                {shortLinks.map((link) => (
                    <ListItem
                        key={link.id}
                        sx={{
                            mb: 1,
                            borderRadius: 2,
                            background: new Date(link.expiry) < new Date() ? "#f8bbd0" : "#e3f2fd",
                            boxShadow: "0 1px 4px #e1bee7",
                        }}
                        secondaryAction={
                            <Button
                                variant="contained"
                                size="small"
                                color={new Date(link.expiry) < new Date() ? "inherit" : "primary"}
                                onClick={() => handleRedirect(link.code)}
                                disabled={new Date(link.expiry) < new Date()}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    background: new Date(link.expiry) < new Date()
                                        ? "#bdbdbd"
                                        : "linear-gradient(90deg, #1976d2 60%, #ec407a 100%)",
                                }}
                            >
                                Visit
                            </Button>
                        }
                    >
                        <ListItemText
                            primary={
                                <Typography
                                    variant="body1"
                                    component="span"
                                    sx={{
                                        fontWeight: 600,
                                        color: "#1976d2",
                                        wordBreak: "break-all",
                                    }}
                                >
                                    {`${window.location.origin}/s/${link.code}`}
                                </Typography>
                            }
                            secondary={
                                <>
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        sx={{ color: "#616161" }}
                                    >
                                        Original: {link.originalUrl}
                                    </Typography>
                                    <br />
                                    <Typography
                                        variant="caption"
                                        component="span"
                                        sx={{
                                            color: "#7b1fa2",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Valid till: {new Date(link.expiry).toLocaleString()} |{" "}
                                        Clicks: {link.clicks}
                                    </Typography>
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
        <Snackbar
            open={!!error}
            autoHideDuration={4000}
            onClose={() => setError("")}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
            </Alert>
        </Snackbar>
        <Snackbar
            open={!!success}
            autoHideDuration={3000}
            onClose={() => setSuccess("")}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert severity="success" sx={{ borderRadius: 2 }}>
                {success}
            </Alert>
        </Snackbar>
    </Container>
);
};

export default UrlShortener;