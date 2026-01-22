import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  ListSubheader,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { ExpandMore, ExpandLess, Error as ErrorIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import useDynamicSidebar from '../hooks/useDynamicSidebar';

/**
 * DynamicMenu Component
 * Renders menu items dynamically based on user's page_access
 * Updates in real-time via Socket.IO
 * 
 * @param {Object} settings - System settings for theming
 * @param {string} selectedItem - Currently selected menu item
 * @param {Function} onItemClick - Callback when menu item is clicked
 * @param {boolean} flatMode - If true, renders all items flat without category headers
 */
const DynamicMenu = ({ settings, selectedItem, onItemClick, flatMode = false }) => {
  const { menuStructure, loading, error } = useDynamicSidebar();
  const [expandedCategories, setExpandedCategories] = useState({});
  const location = useLocation();

  // Toggle category expansion
  const handleCategoryClick = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={30} sx={{ color: settings?.accentColor || '#FEF9E1' }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ErrorIcon sx={{ color: '#ff5252', fontSize: 20 }} />
          <Typography variant="caption" sx={{ color: '#ff5252' }}>
            Error loading menu
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: settings?.textSecondaryColor, opacity: 0.7 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  // No accessible pages
  if (!menuStructure || Object.keys(menuStructure).length === 0) {
    return null;
  }

  // Flat mode - render all items without category grouping
  if (flatMode) {
    const allItems = [];
    Object.keys(menuStructure).forEach((categoryName) => {
      const category = menuStructure[categoryName];
      // Don't show categories we want to keep hardcoded
      const hardcodedCategories = ['General', 'Personal Data Sheets', 'System Administration'];
      if (!hardcodedCategories.includes(categoryName)) {
        allItems.push(...category.items);
      }
    });

    // Sort alphabetically
    allItems.sort((a, b) => a.name.localeCompare(b.name));

    return (
      <List component="div" disablePadding sx={{ pl: 5.4 }}>
        {allItems.map((item) => {
          const isSelected = selectedItem === item.componentIdentifier || 
                             location.pathname === item.route;

          return (
            <ListItem
              key={item.id}
              button
              component={Link}
              to={item.route}
              onClick={() => onItemClick && onItemClick(item.componentIdentifier)}
              sx={{
                bgcolor: isSelected
                  ? settings?.accentColor || '#FEF9E1'
                  : 'inherit',
                color: isSelected
                  ? settings?.textPrimaryColor || '#6D2323'
                  : settings?.textSecondaryColor || '#FFFFFF',
                '& .MuiListItemIcon-root': {
                  color: isSelected
                    ? settings?.textPrimaryColor || '#6D2323'
                    : settings?.textSecondaryColor || '#FFFFFF',
                },
                '& .MuiListItemText-primary': {
                  color: isSelected
                    ? settings?.textPrimaryColor || '#6D2323'
                    : settings?.textSecondaryColor || '#FFFFFF',
                },
                '&:hover': {
                  bgcolor: settings?.hoverColor || '#6D2323',
                  color: settings?.textSecondaryColor || '#FFFFFF',
                  '& .MuiListItemIcon-root': {
                    color: settings?.textSecondaryColor || '#FFFFFF',
                  },
                  '& .MuiListItemText-primary': {
                    color: settings?.textSecondaryColor || '#FFFFFF',
                  },
                },
                borderTopRightRadius: isSelected ? '15px' : 0,
                borderBottomRightRadius: isSelected ? '15px' : 0,
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ marginRight: '-1rem' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText primary={item.name} sx={{ marginLeft: '-10px' }} />
            </ListItem>
          );
        })}
      </List>
    );
  }

  // Categorized mode - render items grouped by categories
  return (
    <>
      {Object.keys(menuStructure).map((categoryName) => {
        const category = menuStructure[categoryName];
        const isExpanded = expandedCategories[categoryName] !== false; // Default to expanded

        // Don't show categories we want to keep hardcoded
        const hardcodedCategories = ['General', 'Personal Data Sheets', 'System Administration'];
        if (hardcodedCategories.includes(categoryName)) {
          return null;
        }

        return (
          <React.Fragment key={categoryName}>
            {/* Category Toggle */}
            <ListItem
              button
              onClick={() => handleCategoryClick(categoryName)}
              sx={{
                color: settings?.textSecondaryColor || '#FFFFFF',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: settings?.hoverColor || '#6D2323',
                },
              }}
            >
              <ListItemIcon sx={{ color: settings?.textSecondaryColor || '#FFFFFF' }}>
                {React.createElement(category.categoryIcon)}
              </ListItemIcon>
              <ListItemText primary={categoryName} sx={{ marginLeft: '-10px' }} />
              <ListItemIcon
                sx={{
                  marginLeft: '10rem',
                  color: settings?.textSecondaryColor || '#FFFFFF',
                }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
            </ListItem>

            {/* Category Items */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 5.4 }}>
                {category.items.map((item) => {
                  const isSelected = selectedItem === item.componentIdentifier || 
                                     location.pathname === item.route;

                  return (
                    <ListItem
                      key={item.id}
                      button
                      component={Link}
                      to={item.route}
                      onClick={() => onItemClick && onItemClick(item.componentIdentifier)}
                      sx={{
                        bgcolor: isSelected
                          ? settings?.accentColor || '#FEF9E1'
                          : 'inherit',
                        color: isSelected
                          ? settings?.textPrimaryColor || '#6D2323'
                          : settings?.textSecondaryColor || '#FFFFFF',
                        '& .MuiListItemIcon-root': {
                          color: isSelected
                            ? settings?.textPrimaryColor || '#6D2323'
                            : settings?.textSecondaryColor || '#FFFFFF',
                        },
                        '& .MuiListItemText-primary': {
                          color: isSelected
                            ? settings?.textPrimaryColor || '#6D2323'
                            : settings?.textSecondaryColor || '#FFFFFF',
                        },
                        '&:hover': {
                          bgcolor: settings?.hoverColor || '#6D2323',
                          color: settings?.textSecondaryColor || '#FFFFFF',
                          '& .MuiListItemIcon-root': {
                            color: settings?.textSecondaryColor || '#FFFFFF',
                          },
                          '& .MuiListItemText-primary': {
                            color: settings?.textSecondaryColor || '#FFFFFF',
                          },
                        },
                        borderTopRightRadius: isSelected ? '15px' : 0,
                        borderBottomRightRadius: isSelected ? '15px' : 0,
                      }}
                    >
                      {item.icon && (
                        <ListItemIcon sx={{ marginRight: '-1rem' }}>
                          {item.icon}
                        </ListItemIcon>
                      )}
                      <ListItemText primary={item.name} sx={{ marginLeft: '-10px' }} />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default DynamicMenu;
